package com.aijob.service;

import com.aijob.dto.JobRecommendationDto;
import com.aijob.model.Job;
import com.aijob.model.UserProfile;
import com.aijob.repository.JobRepository;
import com.aijob.repository.UserProfileRepository;
import com.aijob.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final JobRepository jobRepository;
    private final UserProfileRepository profileRepository;
    private final UserRepository userRepository;

    public List<JobRecommendationDto> getRecommendations(String email, int limit) {
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return Collections.emptyList();

        var profileOpt = profileRepository.findByUserId(userOpt.get().getId());
        if (profileOpt.isEmpty()) {
            // Return top jobs if no profile
            return jobRepository.findAllOrderByPostedAtDesc().stream()
                .limit(limit)
                .map(job -> new JobRecommendationDto(job, 0, List.of("Complete your profile for personalized recommendations")))
                .collect(Collectors.toList());
        }

        UserProfile profile = profileOpt.get();
        List<Job> allJobs = jobRepository.findAllOrderByPostedAtDesc();

        return allJobs.stream()
            .map(job -> {
                double score = calculateMatchScore(profile, job);
                List<String> reasons = getMatchReasons(profile, job);
                return new JobRecommendationDto(job, score, reasons);
            })
            .sorted(Comparator.comparingDouble(JobRecommendationDto::getMatchScore).reversed())
            .limit(limit)
            .collect(Collectors.toList());
    }

    private double calculateMatchScore(UserProfile profile, Job job) {
        double score = 0.0;

        // Skills matching - 50% weight
        if (profile.getSkills() != null && !profile.getSkills().isBlank()) {
            List<String> userSkills = Arrays.stream(profile.getSkills().split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

            String jobText = String.join(" ",
                Optional.ofNullable(job.getDescription()).orElse(""),
                Optional.ofNullable(job.getRequirements()).orElse(""),
                Optional.ofNullable(job.getTitle()).orElse("")
            ).toLowerCase();

            long matchedSkills = userSkills.stream()
                .filter(skill -> skill.length() > 1 && jobText.contains(skill))
                .count();

            if (!userSkills.isEmpty()) {
                score += ((double) matchedSkills / userSkills.size()) * 50;
            }
        }

        // Title matching - 30% weight
        if (profile.getTitle() != null && !profile.getTitle().isBlank()) {
            String[] titleWords = profile.getTitle().toLowerCase().split("\\s+");
            String jobTitle = job.getTitle().toLowerCase();
            long titleMatches = Arrays.stream(titleWords)
                .filter(w -> w.length() > 2 && jobTitle.contains(w))
                .count();
            if (titleMatches > 0) score += 30.0;
        }

        // Job type preference - 20% weight
        if (profile.getPreferredJobType() != null && job.getJobType() != null &&
            profile.getPreferredJobType().equalsIgnoreCase(job.getJobType())) {
            score += 20.0;
        }

        return score;
    }

    private List<String> getMatchReasons(UserProfile profile, Job job) {
        List<String> reasons = new ArrayList<>();

        if (profile.getSkills() != null && !profile.getSkills().isBlank()) {
            String jobText = String.join(" ",
                Optional.ofNullable(job.getDescription()).orElse(""),
                Optional.ofNullable(job.getRequirements()).orElse("")
            ).toLowerCase();

            List<String> matched = Arrays.stream(profile.getSkills().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty() && s.length() > 1 && jobText.contains(s.toLowerCase()))
                .limit(3)
                .collect(Collectors.toList());

            if (!matched.isEmpty()) {
                reasons.add("Skills match: " + String.join(", ", matched));
            }
        }

        if (profile.getTitle() != null && !profile.getTitle().isBlank()) {
            String[] words = profile.getTitle().toLowerCase().split("\\s+");
            String jobTitle = job.getTitle().toLowerCase();
            boolean titleMatch = Arrays.stream(words).anyMatch(w -> w.length() > 2 && jobTitle.contains(w));
            if (titleMatch) reasons.add("Matches your target role: " + profile.getTitle());
        }

        if (profile.getPreferredJobType() != null && job.getJobType() != null &&
            profile.getPreferredJobType().equalsIgnoreCase(job.getJobType())) {
            reasons.add("Preferred work type: " + job.getJobType());
        }

        if (reasons.isEmpty()) {
            reasons.add("Based on your profile preferences");
        }

        return reasons;
    }
}

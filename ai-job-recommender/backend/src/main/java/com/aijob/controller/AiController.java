package com.aijob.controller;

import com.aijob.dto.*;
import com.aijob.model.CoverLetter;
import com.aijob.model.Job;
import com.aijob.model.User;
import com.aijob.model.UserProfile;
import com.aijob.repository.CoverLetterRepository;
import com.aijob.repository.JobRepository;
import com.aijob.repository.UserProfileRepository;
import com.aijob.repository.UserRepository;
import com.aijob.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final CoverLetterRepository coverLetterRepository;

    @PostMapping("/cover-letter")
    public ResponseEntity<ApiResponse<CoverLetterResponse>> generateCoverLetter(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CoverLetterRequest request) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

            UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Please complete your profile first"));

            String coverLetterText = aiService.generateCoverLetter(profile, job, request.getAdditionalNotes());

            CoverLetter saved = null;
            if (request.isSaveLetter()) {
                CoverLetter coverLetter = CoverLetter.builder()
                    .user(user)
                    .job(job)
                    .content(coverLetterText)
                    .build();
                saved = coverLetterRepository.save(coverLetter);
            }

            CoverLetterResponse response = new CoverLetterResponse(
                saved != null ? saved.getId() : null,
                coverLetterText,
                job.getTitle(),
                job.getCompany(),
                saved != null
            );

            return ResponseEntity.ok(ApiResponse.success("Cover letter generated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/insights")
    public ResponseEntity<ApiResponse<String>> getJobInsights(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody InsightsRequest request) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

            UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Please complete your profile first"));

            String insights = aiService.getJobInsights(profile, job);
            return ResponseEntity.ok(ApiResponse.success(insights));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/cover-letters")
    public ResponseEntity<ApiResponse<List<CoverLetterResponse>>> getMyCoverLetters(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<CoverLetter> letters = coverLetterRepository
            .findByUserEmailOrderByGeneratedAtDesc(userDetails.getUsername());

        List<CoverLetterResponse> responses = letters.stream()
            .map(cl -> new CoverLetterResponse(
                cl.getId(), cl.getContent(),
                cl.getJob().getTitle(), cl.getJob().getCompany(), true))
            .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}

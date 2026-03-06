package com.aijob.service;

import com.aijob.dto.JobDto;
import com.aijob.model.Job;
import com.aijob.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    public List<JobDto> getAllJobs(String search, String jobType, String category, String location) {
        List<Job> jobs;

        if (search != null && !search.trim().isEmpty()) {
            jobs = jobRepository.searchJobs(search.trim());
        } else {
            jobs = jobRepository.findAllOrderByPostedAtDesc();
        }

        if (jobType != null && !jobType.isEmpty()) {
            jobs = jobs.stream()
                .filter(j -> j.getJobType() != null && j.getJobType().equalsIgnoreCase(jobType))
                .collect(Collectors.toList());
        }

        if (category != null && !category.isEmpty()) {
            jobs = jobs.stream()
                .filter(j -> j.getCategory() != null && j.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
        }

        if (location != null && !location.isEmpty()) {
            String loc = location.toLowerCase();
            jobs = jobs.stream()
                .filter(j -> j.getLocation() != null && j.getLocation().toLowerCase().contains(loc))
                .collect(Collectors.toList());
        }

        return jobs.stream().map(JobDto::fromJob).collect(Collectors.toList());
    }

    public Optional<JobDto> getJobById(Long id) {
        return jobRepository.findById(id).map(JobDto::fromJob);
    }
}

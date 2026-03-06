package com.aijob.controller;

import com.aijob.dto.ApiResponse;
import com.aijob.dto.JobDto;
import com.aijob.dto.JobRecommendationDto;
import com.aijob.service.JobService;
import com.aijob.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobDto>>> getAllJobs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location) {
        List<JobDto> jobs = jobService.getAllJobs(search, jobType, category, location);
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobDto>> getJobById(@PathVariable Long id) {
        return jobService.getJobById(id)
            .map(job -> ResponseEntity.ok(ApiResponse.success(job)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/recommended")
    public ResponseEntity<ApiResponse<List<JobRecommendationDto>>> getRecommendedJobs(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "10") int limit) {
        List<JobRecommendationDto> recommendations =
            recommendationService.getRecommendations(userDetails.getUsername(), limit);
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }
}

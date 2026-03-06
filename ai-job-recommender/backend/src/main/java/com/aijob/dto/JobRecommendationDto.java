package com.aijob.dto;

import com.aijob.model.Job;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobRecommendationDto {
    private JobDto job;
    private double matchScore;
    private List<String> matchReasons;

    public JobRecommendationDto(Job job, double matchScore, List<String> matchReasons) {
        this.job = JobDto.fromJob(job);
        this.matchScore = Math.round(matchScore * 10.0) / 10.0;
        this.matchReasons = matchReasons;
    }
}

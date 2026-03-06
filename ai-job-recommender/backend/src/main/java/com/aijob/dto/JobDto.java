package com.aijob.dto;

import com.aijob.model.Job;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class JobDto {
    private Long id;
    private String title;
    private String company;
    private String location;
    private String jobType;
    private String description;
    private String requirements;
    private String salary;
    private String category;
    private LocalDateTime postedAt;

    public static JobDto fromJob(Job job) {
        JobDto dto = new JobDto();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setCompany(job.getCompany());
        dto.setLocation(job.getLocation());
        dto.setJobType(job.getJobType());
        dto.setDescription(job.getDescription());
        dto.setRequirements(job.getRequirements());
        dto.setSalary(job.getSalary());
        dto.setCategory(job.getCategory());
        dto.setPostedAt(job.getPostedAt());
        return dto;
    }
}

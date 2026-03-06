package com.aijob.dto;

import lombok.Data;

@Data
public class UserProfileDto {
    private Long id;
    private String name;
    private String email;
    private String title;
    private String skills;
    private String experience;
    private String education;
    private String resume;
    private String location;
    private String preferredJobType;
    private String linkedinUrl;
    private String githubUrl;
    private String phone;
}

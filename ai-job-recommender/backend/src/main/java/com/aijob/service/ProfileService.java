package com.aijob.service;

import com.aijob.dto.UserProfileDto;
import com.aijob.model.User;
import com.aijob.model.UserProfile;
import com.aijob.repository.UserProfileRepository;
import com.aijob.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserProfileRepository profileRepository;
    private final UserRepository userRepository;

    public UserProfileDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = profileRepository.findByUserId(user.getId())
            .orElseGet(() -> {
                UserProfile newProfile = UserProfile.builder().user(user).build();
                return profileRepository.save(newProfile);
            });

        return toDto(profile, user);
    }

    @Transactional
    public UserProfileDto updateProfile(String email, UserProfileDto dto) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = profileRepository.findByUserId(user.getId())
            .orElseGet(() -> UserProfile.builder().user(user).build());

        profile.setTitle(dto.getTitle());
        profile.setSkills(dto.getSkills());
        profile.setExperience(dto.getExperience());
        profile.setEducation(dto.getEducation());
        profile.setResume(dto.getResume());
        profile.setLocation(dto.getLocation());
        profile.setPreferredJobType(dto.getPreferredJobType());
        profile.setLinkedinUrl(dto.getLinkedinUrl());
        profile.setGithubUrl(dto.getGithubUrl());
        profile.setPhone(dto.getPhone());

        profileRepository.save(profile);
        return toDto(profile, user);
    }

    private UserProfileDto toDto(UserProfile profile, User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(profile.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setTitle(profile.getTitle());
        dto.setSkills(profile.getSkills());
        dto.setExperience(profile.getExperience());
        dto.setEducation(profile.getEducation());
        dto.setResume(profile.getResume());
        dto.setLocation(profile.getLocation());
        dto.setPreferredJobType(profile.getPreferredJobType());
        dto.setLinkedinUrl(profile.getLinkedinUrl());
        dto.setGithubUrl(profile.getGithubUrl());
        dto.setPhone(profile.getPhone());
        return dto;
    }
}

package com.aijob.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CoverLetterResponse {
    private Long id;
    private String coverLetter;
    private String jobTitle;
    private String company;
    private boolean saved;
}

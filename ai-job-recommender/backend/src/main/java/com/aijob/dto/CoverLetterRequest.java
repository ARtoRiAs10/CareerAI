package com.aijob.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CoverLetterRequest {
    @NotNull(message = "Job ID is required")
    private Long jobId;
    private String additionalNotes;
    private boolean saveLetter = true;
}

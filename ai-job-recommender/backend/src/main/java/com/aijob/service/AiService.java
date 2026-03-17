package com.aijob.service;

import com.aijob.model.Job;
import com.aijob.model.UserProfile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.api.url}")
    private String apiUrl;

    @Value("${openrouter.model}")
    private String model;

    @Value("${openrouter.site.url:http://localhost:3000}")
    private String siteUrl;

    @Value("${openrouter.site.name:CareerAI}")
    private String siteName;

    private final RestTemplate restTemplate = new RestTemplate();

    // -------------------------------------------------------
    // Public API
    // -------------------------------------------------------

    public String generateCoverLetter(UserProfile profile, Job job, String additionalNotes) {
        return callOpenRouter(
            "You are an expert career coach and professional cover letter writer.",
            buildCoverLetterPrompt(profile, job, additionalNotes),
            1200
        );
    }

    public String getJobInsights(UserProfile profile, Job job) {
        return callOpenRouter(
            "You are a professional career advisor who provides concise, actionable insights.",
            buildInsightsPrompt(profile, job),
            600
        );
    }

    // -------------------------------------------------------
    // OpenRouter — OpenAI-compatible /v1/chat/completions
    // -------------------------------------------------------

    @SuppressWarnings("unchecked")
    private String callOpenRouter(String systemMessage, String userMessage, int maxTokens) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // ADDED: Explicitly ask for JSON to avoid getting HTML error pages back
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        
        // ADDED: .trim() to prevent hidden space issues from properties file
        headers.setBearerAuth(apiKey.trim());
        
        headers.set("HTTP-Referer", siteUrl);
        headers.set("X-Title", siteName);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("max_tokens", maxTokens);
        body.put("temperature", 0.7);
        body.put("messages", List.of(
            Map.of("role", "system", "content", systemMessage),
            Map.of("role", "user",   "content", userMessage)
        ));

        try {
            // Making the call
            ResponseEntity<Map> resp = restTemplate.postForEntity(apiUrl, new HttpEntity<>(body, headers), Map.class);

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                Map<?, ?> respBody = resp.getBody();

                List<Map<String, Object>> choices = (List<Map<String, Object>>) respBody.get("choices");

                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> msg = (Map<String, Object>) choices.get(0).get("message");
                    if (msg != null && msg.get("content") != null) {
                        return msg.get("content").toString().trim();
                    }
                }
            }

            throw new RuntimeException("Unexpected response format from OpenRouter.");

        } catch (HttpClientErrorException e) {
            // DETAILED ERROR LOGGING: This prints the HTML or JSON error from OpenRouter to your Terminal
            System.err.println("===== OPENROUTER API ERROR =====");
            System.err.println("Status: " + e.getStatusCode());
            System.err.println("Response Body: " + e.getResponseBodyAsString());
            System.err.println("================================");
            
            throw new RuntimeException("OpenRouter API error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
        } catch (Exception e) {
            System.err.println("Failed to call OpenRouter: " + e.getMessage());
            throw new RuntimeException("Failed to call OpenRouter: " + e.getMessage(), e);
        }
    }

    // -------------------------------------------------------
    // Prompt builders
    // -------------------------------------------------------

    private String buildCoverLetterPrompt(UserProfile profile, Job job, String notes) {
        String userName   = profile.getUser() != null ? profile.getUser().getName() : "Candidate";
        String skills     = nvl(profile.getSkills(),     "Not specified");
        String title      = nvl(profile.getTitle(),      "Not specified");
        String experience = nvl(profile.getExperience(), "Not specified");
        String education  = nvl(profile.getEducation(),  "Not specified");
        String location   = nvl(profile.getLocation(),   "Not specified");
        String resume     = nvl(profile.getResume(),     "");
        String salary     = nvl(job.getSalary(),         "Not specified");

        return "Generate a compelling, personalized cover letter for the job application below.\n\n"
            + "**CANDIDATE PROFILE:**\n"
            + "Name: " + userName + "\n"
            + "Target Title: " + title + "\n"
            + "Skills: " + skills + "\n"
            + "Experience: " + experience + "\n"
            + "Education: " + education + "\n"
            + "Location: " + location + "\n"
            + (resume.isEmpty() ? "" : "\nResume Summary:\n" + resume + "\n")
            + "\n**TARGET POSITION:**\n"
            + "Job Title: " + job.getTitle() + "\n"
            + "Company: " + job.getCompany() + "\n"
            + "Location: " + job.getLocation() + "\n"
            + "Job Type: " + job.getJobType() + "\n"
            + "Salary: " + salary + "\n"
            + "\n**Job Description:**\n" + job.getDescription() + "\n"
            + "\n**Requirements:**\n" + job.getRequirements() + "\n"
            + (notes != null && !notes.isBlank() ? "\n**Candidate Notes:**\n" + notes + "\n" : "")
            + "\n**INSTRUCTIONS:**\n"
            + "Write a professional, tailored cover letter that:\n"
            + "1. Starts with 'Dear Hiring Manager,' on the first line\n"
            + "2. Opens with a compelling hook showing genuine enthusiasm for the role\n"
            + "3. Connects the candidate's specific skills to the job requirements\n"
            + "4. Highlights 2-3 key relevant achievements or experiences\n"
            + "5. Shows understanding of the company's needs\n"
            + "6. Ends with a confident call to action and signature line\n"
            + "Keep it 3-4 paragraphs, approximately 350-400 words. Be specific, not generic.";
    }

    private String buildInsightsPrompt(UserProfile profile, Job job) {
        return "Analyze this job match and provide actionable insights for the candidate.\n\n"
            + "Candidate Skills: " + nvl(profile.getSkills(), "Not specified") + "\n"
            + "Candidate Title: "  + nvl(profile.getTitle(),  "Not specified") + "\n"
            + "Candidate Experience: " + nvl(profile.getExperience(), "Not specified") + "\n\n"
            + "Job: " + job.getTitle() + " at " + job.getCompany() + "\n"
            + "Requirements: " + job.getRequirements() + "\n\n"
            + "Provide exactly 4 bullet points (start each with •) covering:\n"
            + "1. Why this candidate is a strong match\n"
            + "2. Key skills to highlight in the application\n"
            + "3. Any skill gaps to address or mention proactively\n"
            + "4. One specific tip for standing out in this application\n\n"
            + "Be specific, concise, and actionable. No preamble — start directly with the bullet points.";
    }

    private String nvl(String v, String fallback) {
        return (v != null && !v.isBlank()) ? v : fallback;
    }
}
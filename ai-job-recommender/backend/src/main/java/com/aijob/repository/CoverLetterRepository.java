package com.aijob.repository;

import com.aijob.model.CoverLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoverLetterRepository extends JpaRepository<CoverLetter, Long> {
    List<CoverLetter> findByUserIdOrderByGeneratedAtDesc(Long userId);
    List<CoverLetter> findByUserEmailOrderByGeneratedAtDesc(String email);
}

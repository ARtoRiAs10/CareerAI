package com.aijob.repository;

import com.aijob.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    @Query("SELECT j FROM Job j WHERE " +
           "LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.company) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.requirements) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.category) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Job> searchJobs(@Param("search") String search);

    List<Job> findByJobTypeIgnoreCase(String jobType);
    List<Job> findByCategoryIgnoreCase(String category);

    @Query("SELECT j FROM Job j ORDER BY j.postedAt DESC")
    List<Job> findAllOrderByPostedAtDesc();
}

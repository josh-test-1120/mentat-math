package org.mentats.mentat.projections;

import java.util.Date;

/**
 * This is purely an interface for use in repository returns
 * This way, the tables can hydrate the keys in a better way
 * especially when Foreign Keys exist in a table, as JPA
 * wants to return an object for that, but this helps
 * ensure that just Ids are sent along as keys
 *
 * This particular projection is directly tied to PSQL,
 * and as such, is used to handle the key response names
 * only
 * @author Joshua Summers
 */
public interface ExamResultDetailsProjection {
    // From ExamResult
    Long getExamResultId();
    String getExamScore();
    Date getExamScheduledDate();
    Date getExamTakenDate();
    Integer getExamVersion();

    // From Exam
    Long getExamId();
    String getExamName();
    Integer getExamState();
    Integer getExamRequired();
    Integer getExamDifficulty();
    Double getExamDuration();
    Integer getExamOnline();

    // From Course
    Long getCourseId();
    String getCourseName();
    String getCourseSection();
    Integer getCourseYear();
    String getCourseQuarter();
    Long getCourseProfessorId();
    String getGradeStrategy();
}
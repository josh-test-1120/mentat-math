package org.mentats.mentat.projections;

import java.util.Date;

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
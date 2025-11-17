package org.mentats.mentat.projections;

import java.time.LocalDate;

/**
 * This is purely an interface for use in repository returns
 * This way, the tables can hydrate the keys in a better way
 * especially when Foreign Keys exist in a table, as JPA
 * wants to return an object for that, but this helps
 * ensure that just Ids are sent along as keys.
 *
 * This includes student information alongside the details
 * student course query
 *
 * This particular projection is directly tied to PSQL,
 * and as such, is used to handle the key response names
 * only
 * @author Joshua Summers
 */
public interface StudentCourseWithUserDetailsProjection {
    // From StudentCourse composite key
    Long getCourseId();
    Long getStudentId();

    // From StudentCourse
    String getStudentCourseGrade();
    LocalDate getStudentDateRegistered();

    // From User
    String getFirstName();
    String getLastName();
    String getUserName();
    String getEmail();
}

# This is the EZMath Scheduler Application.
This application simplifies scheduling, managing,
and reviewing exam attempts. The main purpose was to
simplify the collecting and presentation of exam
results for each attempt.

This was primarily designed for 'mastery' classes
which will assess mastery of subjects through examination
on each topic. This means there can be up to 8 or more
exams in a class, based on the length of the class
and the topic to be learned.

To simplify the logistics associated with tracking,
recording, and assessing a student's
performance overall in the class, this application
will track scheduled exams, their graded results, and
the current progress a student has made in the class,
and their performance towards different letter grades.

# Technologies Used
## Backend
For the backend web-service platform, we are using
Spring Boot. We have limited the configuration to an
API server, since we are using frontend technologies
that leverages API's more than server-sided MVC
pages. This gives us the power of process, validation,
and business logic for handling data and any ETLs
associated with it

## Frontend
We used NextJS for the frontend configuration, which is
a platform that is React based, but includes TailWind CSS
and flowbite. That platform has its own backend component,
but we customized it to integrate with Spring. This way,
page rendering is done within React (NextJS), and the
data management is done by Spring

## Project Breakdown

The directory labeled <i><strong>Backend</strong></i> is
the location where the Spring Boot files are kept, 
maintained, and built. The gradle configuration is in
the root directly, and those files are used to compile
the project.

The directory labeled <i><strong>Frontend</strong></i> is
the location where the NextJS files are kept, maintained,
and built. The build configuration is contained wholly
inside this directly. Node Package Manager (NPM) is used
to maintain packages and build the NextJS project.

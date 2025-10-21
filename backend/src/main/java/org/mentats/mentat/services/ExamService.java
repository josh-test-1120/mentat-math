package org.mentats.mentat.services;

import jakarta.persistence.EntityNotFoundException;
import org.mentats.mentat.exceptions.ValidationException;
import org.mentats.mentat.models.Course;
import org.mentats.mentat.models.Exam;
import org.mentats.mentat.payload.request.ExamRequest;
import org.mentats.mentat.payload.response.ExamResponse;
import org.mentats.mentat.repositories.CourseRepository;
import org.mentats.mentat.repositories.ExamRepository;
import org.mentats.mentat.components.ExamValidator;
import org.mentats.mentat.exceptions.ExamNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for handling exam repository logic
 * @author Joshua Summers
 */
@Service
public class ExamService {
    // Repository services
    @Autowired
    private ExamRepository examRepository;
    @Autowired
    private CourseRepository courseRepository;
    // Validator Service
    @Autowired
    private ExamValidator validator;
    // Entity Foreign Keys
    private Course course;

    /**
     * Utility to load Foreign Keys
     */
    private void GetForeignKeyObjects(ExamRequest examRequest) {
        // Find related entities
        course = courseRepository.findById(examRequest.getExamCourseId())
                .orElseThrow(() -> new EntityNotFoundException("Course not found with ID: " + examRequest.getExamCourseId()));
    }

    /**
     * Create new Exam object
     * @param examRequest The exam request containing exam details
     * @return ExamResponse object with the created exam data
     * @throws EntityNotFoundException if the referenced Course is not found
     * @throws ValidationException if the exam request validation fails
     */
    // Create exam result
    @Transactional
    public ExamResponse createExam(ExamRequest examRequest) {
        // Run Validations
        validator.validateForCreation(examRequest);

        // Get referenced objects (FKs)
        GetForeignKeyObjects(examRequest);

        // Create entity
        Exam exam = new Exam();
        exam.setCourse(course);
        exam.setDifficulty(examRequest.getExamDifficulty());
        exam.setState(examRequest.getExamState());
        exam.setRequired(examRequest.getExamRequired());
        exam.setName(examRequest.getExamName());
        exam.setDuration(examRequest.getExamDuration());
        exam.setOnline(examRequest.getExamOnline());
        exam.setExpirationDate(examRequest.getExamExpirationDate());

        // Save and return response DTO
        Exam saved = examRepository.save(exam);
        return new ExamResponse(saved);
    }

    /**
     * Fetch Exam object by Id from database
     * @param id
     * @return Exam object
     */
    // Read exam by ID
    public Exam getExamById(Long id) {
        validator.validateExamId(id);
        return examRepository.findById(id)
                .orElseThrow(() -> new ExamNotFoundException("Course Id not found: " + id.toString()));
    }

    /**
     * Fetch all Exam objects from the database
     * @return List of Exam objects
     */
    // Read all exams
    public List<ExamResponse> getAllExams() {
        List<Exam> exams = examRepository.findAll();

        return exams.stream()
                .map(proj -> new ExamResponse(
                        proj.getId(),
                        proj.getCourseId(),
                        proj.getName(),
                        proj.getDifficulty(),
                        proj.getState(),
                        proj.getRequired(),
                        proj.getDuration(),
                        proj.getOnline(),
                        proj.getExpirationDate()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Fetch all Exam objects by Course Id from the database
     * @param courseId
     * @return List of Exam objects
     */
    // Read exams by course ID
    public List<ExamResponse> getExamsByCourseId(Long courseId) {
        validator.validateCourseId(courseId);

        List<Exam> projections = examRepository.findByCourse_CourseId(courseId);

        return projections.stream()
                .map(proj -> new ExamResponse(
                        proj.getId(),
                        proj.getCourseId(),
                        proj.getName(),
                        proj.getDifficulty(),
                        proj.getState(),
                        proj.getRequired(),
                        proj.getDuration(),
                        proj.getOnline(),
                        proj.getExpirationDate()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Fetch all Exam objects by based on exam state value
     * @param state
     * @return List of Exam objects
     */
    // Read exams by state
    public List<ExamResponse> getExamsByState(Integer state) {
        if (state == null) {
            throw new ValidationException("Exam state cannot be null");
        }

        List<Exam> exams = examRepository.findByState(state);

        return exams.stream()
                .map(proj -> new ExamResponse(
                        proj.getId(),
                        proj.getCourseId(),
                        proj.getName(),
                        proj.getDifficulty(),
                        proj.getState(),
                        proj.getRequired(),
                        proj.getDuration(),
                        proj.getOnline(),
                        proj.getExpirationDate()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Fetch all Exam objects based on exam required value
     * @param required
     * @return List of Exam objects
     */
    // Read exams by required status
    public List<ExamResponse> getExamsByRequired(Integer required) {
        if (required == null) {
            throw new ValidationException("Required status cannot be null");
        }

        List<Exam> exams = examRepository.findByRequired(required);

        return exams.stream()
                .map(proj -> new ExamResponse(
                        proj.getId(),
                        proj.getCourseId(),
                        proj.getName(),
                        proj.getDifficulty(),
                        proj.getState(),
                        proj.getRequired(),
                        proj.getDuration(),
                        proj.getOnline(),
                        proj.getExpirationDate()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Fetch all Exam objects based on exam online value
     * @param online
     * @return List of Exam objects
     */
    // Read exams by online status
    public List<ExamResponse> getExamsByOnline(Integer online) {
        if (online == null) {
            throw new ValidationException("Online status cannot be null");
        }

        List<Exam> exams = examRepository.findByOnline(online);

        return exams.stream()
                .map(proj -> new ExamResponse(
                        proj.getId(),
                        proj.getCourseId(),
                        proj.getName(),
                        proj.getDifficulty(),
                        proj.getState(),
                        proj.getRequired(),
                        proj.getDuration(),
                        proj.getOnline(),
                        proj.getExpirationDate()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Fetch all Exam objects based on Course Id and the state of the exam
     * @param courseId
     * @param state
     * @return List of Exam objects
     */
    // Read exams by course ID and state
    public List<ExamResponse> getExamsByCourseIdAndState(Long courseId, Integer state) {
        validator.validateCourseId(courseId);
        if (state == null) {
            throw new ValidationException("Exam state cannot be null");
        }

        List<Exam> exams = examRepository.findByCourse_CourseIdAndState(courseId, state);

        return exams.stream()
                .map(proj -> new ExamResponse(
                        proj.getId(),
                        proj.getCourseId(),
                        proj.getName(),
                        proj.getDifficulty(),
                        proj.getState(),
                        proj.getRequired(),
                        proj.getDuration(),
                        proj.getOnline(),
                        proj.getExpirationDate()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Update the Exam object
     * @param id
     * @param examUpdates
     * @return Exam object
     */
    // Update exam
    @Transactional
    public Exam updateExam(Long id, ExamRequest examUpdates) {
        if (examUpdates == null) {
            throw new ValidationException("Post data for exam cannot be null");
        }
        validator.validateExamId(id);
        Exam existing = getExamById(id);

        validator.validateForUpdate(existing, examUpdates);

        // Get referenced objects (FKs)
        GetForeignKeyObjects(examUpdates);

        // Handle FK updates and cascades (if appropriate) *** TBD ***
        // Object Reference updates
        if (examUpdates.getExamCourseId() != null) {
            existing.setCourse(course);
        }

        // Non object updates
        if (examUpdates.getExamName() != null) {
            existing.setName(examUpdates.getExamName());
        }
        if (examUpdates.getExamState() != null) {
            existing.setState(examUpdates.getExamState());
        }
        if (examUpdates.getExamRequired() != null) {
            existing.setRequired(examUpdates.getExamRequired());
        }
        if (examUpdates.getExamDuration() != null) {
            existing.setDuration(examUpdates.getExamDuration());
        }
        if (examUpdates.getExamOnline() != null) {
            existing.setOnline(examUpdates.getExamOnline());
        }
        if (examUpdates.getExamDifficulty() != null) {
            existing.setDifficulty(examUpdates.getExamDifficulty());
        }
        if (examUpdates.getExamExpirationDate() != null) {
            existing.setExpirationDate(examUpdates.getExamExpirationDate());
        }

        return examRepository.save(existing);
    }

    /**
     * Delete the Exam object by Id
     * @param id
     */
    // Delete exam by ID
    public void deleteExam(Long id) {
        validator.validateExamId(id);
        Exam existing = getExamById(id);
        validator.validateDeleteOperation(existing);
        examRepository.delete(existing);
    }

    /**
     * Delete the Exam objects based on Course Id
     * @param courseId
     */
    // Delete exams by course ID
    public void deleteExamsByCourseId(Long courseId) {
        validator.validateCourseId(courseId);
        examRepository.deleteByCourse_CourseId(courseId);
    }
}
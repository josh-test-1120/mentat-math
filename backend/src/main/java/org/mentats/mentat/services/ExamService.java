package org.mentats.mentat.services;

import org.mentats.mentat.exceptions.ValidationException;
import org.mentats.mentat.models.Exam;
import org.mentats.mentat.repositories.ExamRepository;
import org.mentats.mentat.components.ExamValidator;
import org.mentats.mentat.exceptions.ExamNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Service class for handling exam repository logic
 * @author Joshua Summers
 */
@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ExamValidator validator;

    /**
     * Create new Exam object
     * @param exam
     * @return Exam object
     */
    // Create exam
    public Exam createExam(Exam exam) {
        validator.validateForCreation(exam);
        return examRepository.save(exam);
    }

    /**
     * Fetch Exam object by Id from database
     * @param id
     * @return Exam object
     */
    // Read exam by ID
    public Exam getExamById(Integer id) {
        validator.validateExamId(id);
        return examRepository.findById(id)
                .orElseThrow(() -> new ExamNotFoundException(id.toString()));
    }

    /**
     * Fetch all Exam objects from the database
     * @return List of Exam objects
     */
    // Read all exams
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    /**
     * Fetch all Exam objects by Course Id from the database
     * @param courseId
     * @return List of Exam objects
     */
    // Read exams by course ID
    public List<Exam> getExamsByCourseId(Integer courseId) {
        validator.validateCourseId(courseId);
        return examRepository.findByCourseId(courseId);
    }

    /**
     * Fetch all Exam objects by based on exam state value
     * @param state
     * @return List of Exam objects
     */
    // Read exams by state
    public List<Exam> getExamsByState(Boolean state) {
        if (state == null) {
            throw new ValidationException("Exam state cannot be null");
        }
        return examRepository.findByState(state);
    }

    /**
     * Fetch all Exam objects based on exam required value
     * @param required
     * @return List of Exam objects
     */
    // Read exams by required status
    public List<Exam> getExamsByRequired(Boolean required) {
        if (required == null) {
            throw new ValidationException("Required status cannot be null");
        }
        return examRepository.findByRequired(required);
    }

    /**
     * Fetch all Exam objects based on exam online value
     * @param online
     * @return List of Exam objects
     */
    // Read exams by online status
    public List<Exam> getExamsByOnline(Boolean online) {
        if (online == null) {
            throw new ValidationException("Online status cannot be null");
        }
        return examRepository.findByOnline(online);
    }

    /**
     * Fetch all Exam objects based on Course Id and the state of the exam
     * @param courseId
     * @param state
     * @return List of Exam objects
     */
    // Read exams by course ID and state
    public List<Exam> getExamsByCourseIdAndState(Integer courseId, Boolean state) {
        validator.validateCourseId(courseId);
        if (state == null) {
            throw new ValidationException("Exam state cannot be null");
        }
        return examRepository.findByCourseIdAndState(courseId, state);
    }

    /**
     * Update the Exam object
     * @param id
     * @param examUpdates
     * @return Exam object
     */
    // Update exam
    public Exam updateExam(Integer id, Exam examUpdates) {
        validator.validateExamId(id);
        Exam existing = getExamById(id);

        validator.validateForUpdate(existing, examUpdates);

        // Update only provided fields (partial update)
        if (examUpdates.getCourseId() != null) {
            existing.setCourseId(examUpdates.getCourseId());
        }
        if (examUpdates.getName() != null) {
            existing.setName(examUpdates.getName());
        }
        if (examUpdates.getState() != null) {
            existing.setState(examUpdates.getState());
        }
        if (examUpdates.getRequired() != null) {
            existing.setRequired(examUpdates.getRequired());
        }
        if (examUpdates.getDuration() != null) {
            existing.setDuration(examUpdates.getDuration());
        }
        if (examUpdates.getOnline() != null) {
            existing.setOnline(examUpdates.getOnline());
        }

        return examRepository.save(existing);
    }

    /**
     * Delete the Exam object by Id
     * @param id
     */
    // Delete exam by ID
    public void deleteExam(Integer id) {
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
    public void deleteExamsByCourseId(Integer courseId) {
        validator.validateCourseId(courseId);
        examRepository.deleteByCourseId(courseId);
    }
}
package org.mentats.mentat.services;

import org.mentats.mentat.exceptions.ValidationException;
import org.mentats.mentat.models.Exam;
import org.mentats.mentat.repositories.ExamRepository;
import org.mentats.mentat.components.ExamValidator;
import org.mentats.mentat.exceptions.ExamNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ExamValidator validator;

    // Create exam
    public Exam createExam(Exam exam) {
        validator.validateForCreation(exam);
        return examRepository.save(exam);
    }

    // Read exam by ID
    public Exam getExamById(Integer id) {
        validator.validateExamId(id);
        return examRepository.findById(id)
                .orElseThrow(() -> new ExamNotFoundException(id.toString()));
    }

    // Read all exams
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    // Read exams by course ID
    public List<Exam> getExamsByCourseId(Integer courseId) {
        validator.validateCourseId(courseId);
        return examRepository.findByCourseId(courseId);
    }

    // Read exams by state
    public List<Exam> getExamsByState(Boolean state) {
        if (state == null) {
            throw new ValidationException("Exam state cannot be null");
        }
        return examRepository.findByState(state);
    }

    // Read exams by required status
    public List<Exam> getExamsByRequired(Boolean required) {
        if (required == null) {
            throw new ValidationException("Required status cannot be null");
        }
        return examRepository.findByRequired(required);
    }

    // Read exams by online status
    public List<Exam> getExamsByOnline(Boolean online) {
        if (online == null) {
            throw new ValidationException("Online status cannot be null");
        }
        return examRepository.findByOnline(online);
    }

    // Read exams by course ID and state
    public List<Exam> getExamsByCourseIdAndState(Integer courseId, Boolean state) {
        validator.validateCourseId(courseId);
        if (state == null) {
            throw new ValidationException("Exam state cannot be null");
        }
        return examRepository.findByCourseIdAndState(courseId, state);
    }

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

    // Delete exam by ID
    public void deleteExam(Integer id) {
        validator.validateExamId(id);
        Exam existing = getExamById(id);
        validator.validateDeleteOperation(existing);
        examRepository.delete(existing);
    }

    // Delete exams by course ID
    public void deleteExamsByCourseId(Integer courseId) {
        validator.validateCourseId(courseId);
        examRepository.deleteByCourseId(courseId);
    }
}
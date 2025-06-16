-- Create database
CREATE DATABASE IF NOT EXISTS bac_exam;
USE bac_exam;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    school_id INT NOT NULL,
    class VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (school_id) REFERENCES schools(id)
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    school_id INT NOT NULL,
    subjects TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (school_id) REFERENCES schools(id)
);

-- Exam sessions table
CREATE TABLE IF NOT EXISTS exam_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('upcoming', 'active', 'completed') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam papers table
CREATE TABLE IF NOT EXISTS exam_papers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    exam_session_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (exam_session_id) REFERENCES exam_sessions(id)
);

-- Student submissions table
CREATE TABLE IF NOT EXISTS student_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    exam_paper_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    status ENUM('pending', 'graded', 'reviewed') NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (exam_paper_id) REFERENCES exam_papers(id)
);

-- Grading assignments table
CREATE TABLE IF NOT EXISTS grading_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    exam_paper_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (exam_paper_id) REFERENCES exam_papers(id)
);

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT NOT NULL,
    teacher_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    feedback TEXT,
    detailed_scores JSON,
    graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES student_submissions(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- Grade reviews table
CREATE TABLE IF NOT EXISTS grade_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    initial_grade_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    feedback TEXT,
    detailed_scores JSON,
    review_notes TEXT,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES student_submissions(id),
    FOREIGN KEY (reviewer_id) REFERENCES teachers(id),
    FOREIGN KEY (initial_grade_id) REFERENCES grades(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error') NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
); 
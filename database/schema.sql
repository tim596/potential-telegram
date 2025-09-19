-- Bedder World Cities Database Schema
-- Professional SQLite database for tracking city launch progress

-- City type lookup table
CREATE TABLE city_types (
    id INTEGER PRIMARY KEY,
    type_name TEXT UNIQUE NOT NULL,
    priority_score INTEGER NOT NULL,
    description TEXT
);

-- States table
CREATE TABLE states (
    id INTEGER PRIMARY KEY,
    state_code TEXT UNIQUE NOT NULL,
    state_name TEXT UNIQUE NOT NULL,
    total_cities INTEGER DEFAULT 0,
    completed_cities INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Metro areas table  
CREATE TABLE metro_areas (
    id INTEGER PRIMARY KEY,
    state_id INTEGER NOT NULL,
    metro_name TEXT NOT NULL,
    metro_type TEXT NOT NULL CHECK (metro_type IN ('Major Metro', 'Metro', 'Suburbs')),
    parent_metro_id INTEGER, -- For suburbs, references the parent metro
    priority_score INTEGER NOT NULL,
    total_cities INTEGER DEFAULT 0,
    completed_cities INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states (id),
    FOREIGN KEY (parent_metro_id) REFERENCES metro_areas (id)
);

-- Cities table
CREATE TABLE cities (
    id INTEGER PRIMARY KEY,
    city_name TEXT NOT NULL,
    state_id INTEGER NOT NULL,
    metro_area_id INTEGER,
    city_type_id INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMP NULL,
    priority_score INTEGER NOT NULL,
    population INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states (id),
    FOREIGN KEY (metro_area_id) REFERENCES metro_areas (id),
    FOREIGN KEY (city_type_id) REFERENCES city_types (id),
    UNIQUE (city_name, state_id)
);

-- Indexes for performance
CREATE INDEX idx_cities_state ON cities (state_id);
CREATE INDEX idx_cities_metro ON cities (metro_area_id);
CREATE INDEX idx_cities_type ON cities (city_type_id);
CREATE INDEX idx_cities_completed ON cities (is_completed);
CREATE INDEX idx_cities_priority ON cities (priority_score DESC);
CREATE INDEX idx_metro_areas_state ON metro_areas (state_id);
CREATE INDEX idx_metro_areas_parent ON metro_areas (parent_metro_id);

-- Insert city types with priority scores (lower = higher priority)
INSERT INTO city_types (type_name, priority_score, description) VALUES
('Major Metro', 1, 'Large metropolitan areas that anchor regions'),
('Metro', 2, 'Mid-size cities that serve as regional centers'),
('State Capital', 2, 'State capital cities'),
('Suburb', 3, 'Cities that are part of larger metro areas'),
('College Town', 4, 'University towns with student populations'),
('Vacation Town', 5, 'Tourist destinations and vacation areas'),
('Other', 6, 'Other cities and towns');

-- Triggers to update completion counts
CREATE TRIGGER update_state_counts 
    AFTER UPDATE OF is_completed ON cities
BEGIN
    UPDATE states 
    SET completed_cities = (
        SELECT COUNT(*) FROM cities 
        WHERE state_id = NEW.state_id AND is_completed = TRUE
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.state_id;
END;

CREATE TRIGGER update_metro_counts 
    AFTER UPDATE OF is_completed ON cities
    WHEN NEW.metro_area_id IS NOT NULL
BEGIN
    UPDATE metro_areas 
    SET completed_cities = (
        SELECT COUNT(*) FROM cities 
        WHERE metro_area_id = NEW.metro_area_id AND is_completed = TRUE
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.metro_area_id;
END;

-- Views for common queries
CREATE VIEW v_city_progress AS
SELECT 
    c.id,
    c.city_name,
    s.state_name,
    s.state_code,
    m.metro_name,
    ct.type_name as city_type,
    c.is_completed,
    c.completion_date,
    c.priority_score,
    c.population
FROM cities c
JOIN states s ON c.state_id = s.id
LEFT JOIN metro_areas m ON c.metro_area_id = m.id
JOIN city_types ct ON c.city_type_id = ct.id;

CREATE VIEW v_state_summary AS
SELECT 
    s.state_name,
    s.state_code,
    s.total_cities,
    s.completed_cities,
    ROUND(CAST(s.completed_cities AS REAL) / CAST(s.total_cities AS REAL) * 100, 1) as completion_percentage
FROM states s
ORDER BY completion_percentage DESC, s.state_name;

CREATE VIEW v_metro_summary AS
SELECT 
    m.metro_name,
    s.state_name,
    m.metro_type,
    m.total_cities,
    m.completed_cities,
    ROUND(CAST(m.completed_cities AS REAL) / CAST(m.total_cities AS REAL) * 100, 1) as completion_percentage
FROM metro_areas m
JOIN states s ON m.state_id = s.id
ORDER BY completion_percentage DESC, m.metro_name;
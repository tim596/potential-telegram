-- Completion statistics queries for Bedder World cities database

-- Overall completion statistics
SELECT 
    COUNT(*) as total_cities,
    SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) as completed_cities,
    COUNT(*) - SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) as remaining_cities,
    ROUND(CAST(SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) AS REAL) / CAST(COUNT(*) AS REAL) * 100, 1) as completion_percentage
FROM cities;

-- Completion by state
SELECT 
    s.state_name,
    s.state_code,
    s.total_cities,
    s.completed_cities,
    (s.total_cities - s.completed_cities) as remaining_cities,
    ROUND(CAST(s.completed_cities AS REAL) / CAST(s.total_cities AS REAL) * 100, 1) as completion_percentage
FROM states s
WHERE s.total_cities > 0
ORDER BY completion_percentage DESC, s.completed_cities DESC;

-- Completion by metro area
SELECT 
    m.metro_name,
    s.state_name,
    s.state_code,
    m.metro_type,
    m.total_cities,
    m.completed_cities,
    (m.total_cities - m.completed_cities) as remaining_cities,
    ROUND(CAST(m.completed_cities AS REAL) / CAST(m.total_cities AS REAL) * 100, 1) as completion_percentage
FROM metro_areas m
JOIN states s ON m.state_id = s.id
WHERE m.total_cities > 0
ORDER BY completion_percentage DESC, m.completed_cities DESC;

-- Completion by city type
SELECT 
    ct.type_name,
    ct.priority_score,
    COUNT(*) as total_cities,
    SUM(CASE WHEN c.is_completed THEN 1 ELSE 0 END) as completed_cities,
    COUNT(*) - SUM(CASE WHEN c.is_completed THEN 1 ELSE 0 END) as remaining_cities,
    ROUND(CAST(SUM(CASE WHEN c.is_completed THEN 1 ELSE 0 END) AS REAL) / CAST(COUNT(*) AS REAL) * 100, 1) as completion_percentage
FROM city_types ct
JOIN cities c ON ct.id = c.city_type_id
GROUP BY ct.id, ct.type_name, ct.priority_score
ORDER BY ct.priority_score ASC;

-- States with highest completion rates
SELECT 
    s.state_name,
    s.state_code,
    s.total_cities,
    s.completed_cities,
    ROUND(CAST(s.completed_cities AS REAL) / CAST(s.total_cities AS REAL) * 100, 1) as completion_percentage
FROM states s
WHERE s.total_cities > 0
ORDER BY completion_percentage DESC, s.completed_cities DESC
LIMIT 10;

-- Metro areas with highest completion rates
SELECT 
    m.metro_name,
    s.state_code,
    m.metro_type,
    m.total_cities,
    m.completed_cities,
    ROUND(CAST(m.completed_cities AS REAL) / CAST(m.total_cities AS REAL) * 100, 1) as completion_percentage
FROM metro_areas m
JOIN states s ON m.state_id = s.id
WHERE m.total_cities > 0
ORDER BY completion_percentage DESC, m.completed_cities DESC
LIMIT 10;
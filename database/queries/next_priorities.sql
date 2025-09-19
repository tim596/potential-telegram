-- Priority queries for determining next cities to launch

-- Next 20 cities by priority
SELECT 
    c.city_name,
    s.state_name,
    s.state_code,
    m.metro_name,
    ct.type_name as city_type,
    c.priority_score
FROM cities c
JOIN states s ON c.state_id = s.id
LEFT JOIN metro_areas m ON c.metro_area_id = m.id
JOIN city_types ct ON c.city_type_id = ct.id
WHERE c.is_completed = FALSE
ORDER BY c.priority_score ASC, c.city_name ASC
LIMIT 20;

-- Next Major Metro cities (highest priority)
SELECT 
    c.city_name,
    s.state_name,
    s.state_code,
    m.metro_name,
    ct.type_name as city_type
FROM cities c
JOIN states s ON c.state_id = s.id
LEFT JOIN metro_areas m ON c.metro_area_id = m.id
JOIN city_types ct ON c.city_type_id = ct.id
WHERE c.is_completed = FALSE 
AND ct.type_name = 'Major Metro'
ORDER BY c.city_name ASC;

-- Next Metro cities (second priority)
SELECT 
    c.city_name,
    s.state_name,
    s.state_code,
    m.metro_name,
    ct.type_name as city_type
FROM cities c
JOIN states s ON c.state_id = s.id
LEFT JOIN metro_areas m ON c.metro_area_id = m.id
JOIN city_types ct ON c.city_type_id = ct.id
WHERE c.is_completed = FALSE 
AND ct.type_name IN ('Metro', 'State Capital')
ORDER BY ct.priority_score ASC, c.city_name ASC
LIMIT 20;

-- States with no completed cities yet
SELECT 
    s.state_name,
    s.state_code,
    s.total_cities,
    COUNT(c.id) as incomplete_major_metros
FROM states s
LEFT JOIN cities c ON s.id = c.state_id 
LEFT JOIN city_types ct ON c.city_type_id = ct.id
WHERE s.completed_cities = 0
AND c.is_completed = FALSE
AND ct.type_name = 'Major Metro'
GROUP BY s.id, s.state_name, s.state_code, s.total_cities
ORDER BY s.total_cities DESC;

-- Metro areas with partially completed cities (good for continuation)
SELECT 
    m.metro_name,
    s.state_name,
    s.state_code,
    m.total_cities,
    m.completed_cities,
    (m.total_cities - m.completed_cities) as remaining_cities,
    ROUND(CAST(m.completed_cities AS REAL) / CAST(m.total_cities AS REAL) * 100, 1) as completion_percentage
FROM metro_areas m
JOIN states s ON m.state_id = s.id
WHERE m.completed_cities > 0 
AND m.completed_cities < m.total_cities
ORDER BY completion_percentage DESC, remaining_cities ASC;

-- Next city by state (useful for geographic expansion)
SELECT DISTINCT
    s.state_name,
    s.state_code,
    first_value(c.city_name) OVER (PARTITION BY s.id ORDER BY c.priority_score ASC, c.city_name ASC) as next_city,
    first_value(ct.type_name) OVER (PARTITION BY s.id ORDER BY c.priority_score ASC, c.city_name ASC) as city_type,
    first_value(m.metro_name) OVER (PARTITION BY s.id ORDER BY c.priority_score ASC, c.city_name ASC) as metro_name
FROM states s
JOIN cities c ON s.id = c.state_id
JOIN city_types ct ON c.city_type_id = ct.id
LEFT JOIN metro_areas m ON c.metro_area_id = m.id
WHERE c.is_completed = FALSE
ORDER BY s.state_name;

-- All incomplete cities in metros where we've started (strategic completion)
SELECT 
    c.city_name,
    s.state_name,
    s.state_code,
    m.metro_name,
    ct.type_name as city_type,
    c.priority_score
FROM cities c
JOIN states s ON c.state_id = s.id
JOIN metro_areas m ON c.metro_area_id = m.id
JOIN city_types ct ON c.city_type_id = ct.id
WHERE c.is_completed = FALSE
AND m.completed_cities > 0  -- Metro has at least one completed city
ORDER BY m.metro_name, c.priority_score ASC, c.city_name ASC;
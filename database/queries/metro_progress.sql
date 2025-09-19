-- Metro area progress and analysis queries

-- All metro areas with progress details
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

-- Major Metro areas progress
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
WHERE m.metro_type = 'Major Metro'
AND m.total_cities > 0
ORDER BY completion_percentage DESC, m.completed_cities DESC;

-- Metro areas by state
SELECT 
    s.state_name,
    COUNT(m.id) as metro_count,
    SUM(m.total_cities) as total_metro_cities,
    SUM(m.completed_cities) as completed_metro_cities,
    ROUND(CAST(SUM(m.completed_cities) AS REAL) / CAST(SUM(m.total_cities) AS REAL) * 100, 1) as metro_completion_percentage
FROM states s
JOIN metro_areas m ON s.id = m.state_id
WHERE m.total_cities > 0
GROUP BY s.id, s.state_name
ORDER BY metro_completion_percentage DESC;

-- Metro areas ready for completion (75%+ done)
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
AND CAST(m.completed_cities AS REAL) / CAST(m.total_cities AS REAL) >= 0.75
AND m.completed_cities < m.total_cities
ORDER BY completion_percentage DESC, remaining_cities ASC;

-- Metro areas we haven't started (0% completion)
SELECT 
    m.metro_name,
    s.state_name,
    s.state_code,
    m.metro_type,
    m.total_cities,
    -- List the cities in this metro
    GROUP_CONCAT(c.city_name, ', ') as cities
FROM metro_areas m
JOIN states s ON m.state_id = s.id
JOIN cities c ON m.id = c.metro_area_id
WHERE m.completed_cities = 0
AND m.total_cities > 0
GROUP BY m.id, m.metro_name, s.state_name, s.state_code, m.metro_type, m.total_cities
ORDER BY m.metro_type ASC, m.total_cities DESC;

-- Detailed city list by metro area
SELECT 
    m.metro_name,
    s.state_code,
    c.city_name,
    ct.type_name as city_type,
    c.is_completed,
    c.priority_score
FROM metro_areas m
JOIN states s ON m.state_id = s.id
JOIN cities c ON m.id = c.metro_area_id
JOIN city_types ct ON c.city_type_id = ct.id
ORDER BY m.metro_name, c.priority_score ASC, c.city_name ASC;

-- Metro completion leaderboard
SELECT 
    m.metro_name || ', ' || s.state_code as metro_location,
    m.metro_type,
    m.total_cities,
    m.completed_cities,
    ROUND(CAST(m.completed_cities AS REAL) / CAST(m.total_cities AS REAL) * 100, 1) as completion_percentage,
    CASE 
        WHEN m.completed_cities = m.total_cities THEN '🏆 COMPLETE'
        WHEN CAST(m.completed_cities AS REAL) / CAST(m.total_cities AS REAL) >= 0.75 THEN '🥈 NEARLY DONE'
        WHEN m.completed_cities > 0 THEN '🥉 IN PROGRESS'
        ELSE '⏳ NOT STARTED'
    END as status
FROM metro_areas m
JOIN states s ON m.state_id = s.id
WHERE m.total_cities > 0
ORDER BY completion_percentage DESC, m.completed_cities DESC;
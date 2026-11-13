SELECT s.name, s.id, so.id as offering_id, c.name as class_name, l.name as level_name
FROM "Subject" s
LEFT JOIN "SubjectOffering" so ON s.id = so.subjectId
LEFT JOIN "Class" c ON so.classId = c.id
LEFT JOIN "Level" l ON c.levelId = l.id
WHERE l.name LIKE '%9%'
  AND so.sessionId = 2
  AND so.isActive = true
ORDER BY s.name;

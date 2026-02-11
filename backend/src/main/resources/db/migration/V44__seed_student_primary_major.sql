-- Ensure every student has exactly one PRIMARY major aligned with student_profile.dept_id.
-- Existing PRIMARY mappings are preserved.

INSERT INTO student_major (
  student_account_id,
  major_id,
  major_type,
  created_at,
  updated_at
)
SELECT
  sp.account_id,
  picked.major_id,
  'PRIMARY',
  now(),
  now()
FROM student_profile sp
JOIN LATERAL (
  SELECT m.major_id
  FROM major m
  WHERE m.dept_id = sp.dept_id
  ORDER BY m.sort_order ASC, m.major_id ASC
  LIMIT 1
) picked ON true
LEFT JOIN student_major sm_primary
  ON sm_primary.student_account_id = sp.account_id
 AND sm_primary.major_type = 'PRIMARY'
WHERE sm_primary.student_account_id IS NULL
ON CONFLICT (student_account_id, major_id) DO NOTHING;

-- Inserts the made-up starting records only when the table is empty.
INSERT INTO records (title, category, description, status)
SELECT * FROM (VALUES
  ('Broken classroom light', 'Electrical', 'The light in Room B12 does not switch on.', 'Pending'),
  ('Leaking tap in library', 'Plumbing', 'The tap in the ground floor washroom drips constantly.', 'In progress'),
  ('Cracked chair in Lab 3', 'Furniture', 'Chair at station 7 has a cracked leg and is unsafe.', 'Pending'),
  ('Flickering corridor lights', 'Electrical', 'Lights in the Block C corridor flicker at night.', 'Completed'),
  ('Blocked sink in cafeteria', 'Plumbing', 'The staff sink drains very slowly and smells.', 'In progress'),
  ('Wobbly lecture desk', 'Furniture', 'Desk in Hall A row 4 is unstable and needs fixing.', 'Completed'),
  ('Dead socket in study room', 'Electrical', 'The wall socket near the window gives no power.', 'Pending'),
  ('Broken toilet flush', 'Plumbing', 'Second cubicle flush handle in Block D is broken.', 'Pending')
) AS v(title, category, description, status)
WHERE NOT EXISTS (SELECT 1 FROM records);

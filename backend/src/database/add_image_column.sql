-- Add IMAGE column to Pokemon table for storing binary image data
ALTER TABLE pokemon 
ADD COLUMN IF NOT EXISTS image BYTEA;

-- Add index for image column if needed for performance
CREATE INDEX IF NOT EXISTS idx_pokemon_image_not_null ON pokemon(id) WHERE image IS NOT NULL;

-- Add comment to describe the new column
COMMENT ON COLUMN pokemon.image IS 'Binary data of the Pokemon image downloaded from image_url';
import axios from 'axios';
import { supabase } from '../config/supabase';

interface PokemonImageData {
  id: number;
  name: string;
  image_url: string;
}

export class PokemonImageDownloader {
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  async downloadAllPokemonImages(): Promise<void> {
    console.log('🚀 포켓몬 이미지 다운로드 시작...');
    
    try {
      // Get all pokemon with image_url but no image data
      const { data: pokemonList, error } = await supabase
        .from('pokemon')
        .select('id, name, image_url')
        .is('image', null);

      if (error) {
        throw new Error(`포켓몬 데이터 조회 실패: ${error.message}`);
      }

      if (!pokemonList || pokemonList.length === 0) {
        console.log('✅ 모든 포켓몬 이미지가 이미 다운로드되었습니다.');
        return;
      }

      console.log(`📊 다운로드할 포켓몬 수: ${pokemonList.length}개`);

      let successCount = 0;
      let failCount = 0;

      for (const pokemon of pokemonList) {
        try {
          console.log(`📥 다운로드 중: ${pokemon.name} (ID: ${pokemon.id})`);
          
          const imageBuffer = await this.downloadImageWithRetry(pokemon.image_url);
          await this.saveImageToDatabase(pokemon.id, imageBuffer);
          
          successCount++;
          console.log(`✅ ${pokemon.name} 완료 (${successCount}/${pokemonList.length})`);
          
          // Rate limiting to avoid overwhelming the server
          await this.delay(500);
          
        } catch (error) {
          console.error(`❌ ${pokemon.name} 실패:`, error);
          failCount++;
        }
      }

      console.log('🎉 이미지 다운로드 완료!');
      console.log(`✅ 성공: ${successCount}개`);
      console.log(`❌ 실패: ${failCount}개`);

    } catch (error) {
      console.error('💥 이미지 다운로드 프로세스 실패:', error);
      throw error;
    }
  }

  private async downloadImageWithRetry(imageUrl: string): Promise<Buffer> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 다운로드 시도 ${attempt}/${this.maxRetries}: ${imageUrl}`);
        
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 10000, // 10 seconds timeout
          headers: {
            'User-Agent': 'Pokemon-Math-Adventure/1.0'
          }
        });

        if (response.status !== 200) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const buffer = Buffer.from(response.data);
        
        if (buffer.length === 0) {
          throw new Error('Empty image data received');
        }

        console.log(`📊 이미지 크기: ${Math.round(buffer.length / 1024)}KB`);
        return buffer;

      } catch (error) {
        console.error(`⚠️ 시도 ${attempt} 실패:`, error);
        
        if (attempt === this.maxRetries) {
          throw new Error(`Failed to download image after ${this.maxRetries} attempts: ${error}`);
        }
        
        // Exponential backoff
        await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
      }
    }

    throw new Error('Unexpected error in downloadImageWithRetry');
  }

  private async saveImageToDatabase(pokemonId: number, imageBuffer: Buffer): Promise<void> {
    try {
      const { error } = await supabase
        .from('pokemon')
        .update({
          image: imageBuffer,
          updated_at: new Date().toISOString()
        })
        .eq('id', pokemonId);

      if (error) {
        throw new Error(`데이터베이스 저장 실패: ${error.message}`);
      }

      console.log(`💾 데이터베이스 저장 완료: Pokemon ID ${pokemonId}`);

    } catch (error) {
      console.error(`💥 데이터베이스 저장 오류 (Pokemon ID: ${pokemonId}):`, error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get image from database
  async getPokemonImage(pokemonId: number): Promise<Buffer | null> {
    try {
      const { data, error } = await supabase
        .from('pokemon')
        .select('image')
        .eq('id', pokemonId)
        .single();

      if (error) {
        throw new Error(`이미지 조회 실패: ${error.message}`);
      }

      return data?.image ? Buffer.from(data.image) : null;

    } catch (error) {
      console.error(`포켓몬 이미지 조회 오류 (ID: ${pokemonId}):`, error);
      return null;
    }
  }

  // Get download statistics
  async getDownloadStats(): Promise<{
    total: number;
    withImages: number;
    withoutImages: number;
    completionRate: number;
  }> {
    try {
      const { data: totalCount, error: totalError } = await supabase
        .from('pokemon')
        .select('id', { count: 'exact' });

      const { data: withImagesCount, error: imagesError } = await supabase
        .from('pokemon')
        .select('id', { count: 'exact' })
        .not('image', 'is', null);

      if (totalError || imagesError) {
        throw new Error('통계 조회 실패');
      }

      const total = totalCount?.length || 0;
      const withImages = withImagesCount?.length || 0;
      const withoutImages = total - withImages;
      const completionRate = total > 0 ? Math.round((withImages / total) * 100) : 0;

      return {
        total,
        withImages,
        withoutImages,
        completionRate
      };

    } catch (error) {
      console.error('다운로드 통계 조회 오류:', error);
      return {
        total: 0,
        withImages: 0,
        withoutImages: 0,
        completionRate: 0
      };
    }
  }

  // Verify image integrity
  async verifyImageIntegrity(pokemonId: number): Promise<boolean> {
    try {
      const image = await this.getPokemonImage(pokemonId);
      
      if (!image) {
        return false;
      }

      // Basic validation: check if it's a valid image by checking common image headers
      const isPNG = image.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
      const isJPEG = image.subarray(0, 3).equals(Buffer.from([0xFF, 0xD8, 0xFF]));
      const isGIF = image.subarray(0, 6).equals(Buffer.from('GIF87a')) || 
                    image.subarray(0, 6).equals(Buffer.from('GIF89a'));

      return isPNG || isJPEG || isGIF;

    } catch (error) {
      console.error(`이미지 무결성 검사 오류 (Pokemon ID: ${pokemonId}):`, error);
      return false;
    }
  }
}
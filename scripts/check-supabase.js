/**
 * Script pour vérifier la connexion Supabase et lister les ressources
 * Usage: node scripts/check-supabase.js
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   SUPABASE_URL:', url ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', key ? '✓' : '✗');
  console.error('\n💡 Vérifiez votre fichier .env ou les variables sur Vercel.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function checkSupabase() {
  console.log('🔍 Vérification de la connexion Supabase...\n');

  try {
    // Vérifier managed_categories
    const { data: categories, error: catError } = await supabase
      .from('managed_categories')
      .select('*')
      .order('sort_order');

    if (catError) {
      console.error('❌ Erreur lors de la lecture de managed_categories:', catError.message);
    } else {
      console.log(`✓ managed_categories: ${categories?.length || 0} catégories`);
      if (categories && categories.length > 0) {
        console.log('   Catégories:', categories.map(c => c.name).join(', '));
      }
    }

    // Vérifier managed_resources
    const { data: resources, error: resError } = await supabase
      .from('managed_resources')
      .select('*')
      .order('sort_order');

    if (resError) {
      console.error('❌ Erreur lors de la lecture de managed_resources:', resError.message);
    } else {
      console.log(`✓ managed_resources: ${resources?.length || 0} ressources`);
      if (resources && resources.length > 0) {
        console.log('\n   Ressources trouvées:');
        resources.slice(0, 10).forEach(r => {
          console.log(`   - ${r.name} (${r.category_id})`);
        });
        if (resources.length > 10) {
          console.log(`   ... et ${resources.length - 10} autres`);
        }
      }
    }

    // Vérifier custom_resources
    const { data: customRes, error: customError } = await supabase
      .from('custom_resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (customError) {
      console.error('❌ Erreur lors de la lecture de custom_resources:', customError.message);
    } else {
      console.log(`✓ custom_resources: ${customRes?.length || 0} ressources`);
    }

    console.log('\n✅ Connexion Supabase OK');
    console.log(`📊 Total: ${(categories?.length || 0) + (resources?.length || 0) + (customRes?.length || 0)} ressources en base`);

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

checkSupabase();

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, file_name } = await req.json();
    if (!image_url) {
      return Response.json({ error: 'image_url is required' }, { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const bucket = Deno.env.get('SUPABASE_STORAGE_BUCKET');

    if (!supabaseUrl || !serviceKey || !bucket) {
      return Response.json({ error: 'Supabase env vars not configured' }, { status: 500 });
    }

    // 1. Download the image from the generated URL
    const imgRes = await fetch(image_url);
    if (!imgRes.ok) {
      return Response.json({ error: 'Failed to fetch source image' }, { status: 500 });
    }
    const contentType = imgRes.headers.get('content-type') || 'image/png';
    const imgBuffer = await imgRes.arrayBuffer();

    // 2. Build a safe file name
    const ext = contentType.split('/')[1]?.split(';')[0] || 'png';
    const safeName = (file_name || `img-${Date.now()}`).replace(/[^a-z0-9-_]/gi, '_');
    const path = `${user.email.replace(/[^a-z0-9]/gi, '_')}/${safeName}-${Date.now()}.${ext}`;

    // 3. Upload to Supabase Storage
    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucket}/${path}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': contentType,
          'x-upsert': 'true',
        },
        body: imgBuffer,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('Supabase upload error:', uploadRes.status, errText);
      return Response.json({ error: `Supabase upload failed: ${uploadRes.status}` }, { status: 500 });
    }

    // 4. Build public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;

    return Response.json({ url: publicUrl, path });
  } catch (error) {
    console.error('uploadImageToSupabase error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
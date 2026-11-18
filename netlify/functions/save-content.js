/**
 * Buttercup Studio Visual CMS - Netlify Serverless Function
 * Enables saving customizations on Netlify-hosted deployments.
 */
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body || '{}');
      const customizations = data.customizations || {};

      // If GitHub Personal Access Token is configured in Netlify Environment Variables
      const ghToken = process.env.GITHUB_TOKEN;
      const repo = process.env.GITHUB_REPO || 'vaktabas/buttercup-advertising-studio-web-code';

      if (ghToken) {
        // Fetch current file SHA
        const getUrl = `https://api.github.com/repos/${repo}/contents/data/site-customizations.json`;
        let sha = null;
        try {
          const getRes = await fetch(getUrl, {
            headers: {
              'Authorization': `token ${ghToken}`,
              'User-Agent': 'Buttercup-CMS'
            }
          });
          if (getRes.ok) {
            const fileInfo = await getRes.json();
            sha = fileInfo.sha;
          }
        } catch (_) {}

        // Commit updated JSON to GitHub
        const contentBase64 = Buffer.from(JSON.stringify(customizations, null, 2)).toString('base64');
        const putPayload = {
          message: 'Visual CMS: Update site customizations from admin device',
          content: contentBase64,
          branch: 'main'
        };
        if (sha) putPayload.sha = sha;

        const putRes = await fetch(getUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${ghToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Buttercup-CMS'
          },
          body: JSON.stringify(putPayload)
        });

        if (putRes.ok) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Committed to GitHub and deployed live!' })
          };
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Customizations received.' })
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: err.message })
      };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};

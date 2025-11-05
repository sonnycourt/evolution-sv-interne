exports.handler = async (event, context) => {
    // Récupération des variables d'environnement
    const API_KEY = process.env.MAILERLITE_API_KEY;
    const GROUP_ID = process.env.MAILERLITE_GROUP_ID;

    // Vérification que les variables sont définies
    if (!API_KEY || !GROUP_ID) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                error: 'Variables d\'environnement manquantes. Veuillez configurer MAILERLITE_API_KEY et MAILERLITE_GROUP_ID dans Netlify.',
            }),
        };
    }

    try {
        // Appel à l'API MailerLite pour récupérer le nombre d'abonnés du groupe
        const response = await fetch(`https://connect.mailerlite.com/api/groups/${GROUP_ID}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur API MailerLite: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                subscriberCount: data.data?.active_count || 0,
            }),
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des emails:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                error: error.message || 'Erreur lors de la récupération des données',
            }),
        };
    }
};


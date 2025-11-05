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
        // Récupérer le nombre total d'abonnés du groupe
        const groupResponse = await fetch(`https://connect.mailerlite.com/api/groups/${GROUP_ID}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!groupResponse.ok) {
            const errorText = await groupResponse.text();
            throw new Error(`Erreur API MailerLite: ${groupResponse.status} - ${errorText}`);
        }

        const groupData = await groupResponse.json();
        const subscriberCount = groupData.data?.active_count || 0;

        // Récupérer les abonnés du groupe avec leurs dates d'inscription
        // Utiliser l'endpoint spécifique du groupe pour récupérer les abonnés
        let allSubscribers = [];
        let page = 1;
        let hasMore = true;
        const limit = 100; // Limite par page de l'API MailerLite

        while (hasMore && page <= 20) { // Limiter à 20 pages pour couvrir jusqu'à 2000 abonnés
            try {
                const subscribersResponse = await fetch(
                    `https://connect.mailerlite.com/api/groups/${GROUP_ID}/subscribers?filter[status]=active&limit=${limit}&page=${page}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${API_KEY}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                    }
                );

                if (!subscribersResponse.ok) {
                    console.warn(`Erreur lors de la récupération de la page ${page}: ${subscribersResponse.status}`);
                    break;
                }

                const subscribersData = await subscribersResponse.json();
                
                if (subscribersData.data && subscribersData.data.length > 0) {
                    allSubscribers = allSubscribers.concat(subscribersData.data);
                    
                    // Vérifier s'il y a plus de pages
                    hasMore = subscribersData.data.length === limit;
                    page++;
                } else {
                    hasMore = false;
                }
            } catch (error) {
                console.warn(`Erreur lors de la récupération de la page ${page}:`, error);
                break;
            }
        }

        // Calculer les emails par jour en fonction des dates d'inscription
        const dailyCounts = {};
        const startDate = new Date('2025-11-04T00:00:00');
        const endDate = new Date('2025-12-04T23:59:59');
        
        allSubscribers.forEach(subscriber => {
            if (subscriber.created_at) {
                const subscriptionDate = new Date(subscriber.created_at);
                subscriptionDate.setHours(0, 0, 0, 0);
                
                // Vérifier si la date est dans la période
                if (subscriptionDate >= startDate && subscriptionDate <= endDate) {
                    const dateKey = `${subscriptionDate.getFullYear()}-${String(subscriptionDate.getMonth() + 1).padStart(2, '0')}-${String(subscriptionDate.getDate()).padStart(2, '0')}`;
                    
                    if (!dailyCounts[dateKey]) {
                        dailyCounts[dateKey] = 0;
                    }
                    dailyCounts[dateKey]++;
                }
            }
        });
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                subscriberCount: subscriberCount,
                dailyCounts: dailyCounts,
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


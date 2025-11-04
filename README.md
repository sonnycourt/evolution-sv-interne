# Dashboard MailerLite - Objectif 10K

Dashboard pour suivre le nombre d'abonnés MailerLite avec un objectif de 10,000 abonnés.

## Configuration

### Variables d'environnement

Pour que le dashboard fonctionne, tu dois configurer les variables d'environnement suivantes dans Netlify :

1. **MAILERLITE_API_KEY** : Ta clé API MailerLite
2. **MAILERLITE_GROUP_ID** : L'ID du groupe MailerLite que tu veux suivre

### Comment configurer dans Netlify

1. Va sur ton site Netlify
2. Clique sur **Site settings** → **Environment variables**
3. Ajoute les deux variables :
   - **Key**: `MAILERLITE_API_KEY`
   - **Value**: Ta clé API MailerLite
   
   - **Key**: `MAILERLITE_GROUP_ID`
   - **Value**: L'ID de ton groupe MailerLite

4. Clique sur **Save** et redéploie ton site

### Développement local

Pour tester en local avec Netlify CLI :

1. Installe Netlify CLI : `npm install -g netlify-cli`
2. Crée un fichier `.env.local` avec :
   ```
   MAILERLITE_API_KEY=ton_api_key_ici
   MAILERLITE_GROUP_ID=ton_group_id_ici
   ```
3. Lance `netlify dev` pour tester localement

## Structure

- `index.html` : Interface du dashboard
- `netlify/functions/fetch-subscribers.js` : Fonction serverless qui fait l'appel API MailerLite
- `netlify.toml` : Configuration Netlify

## Déploiement

Le site se déploie automatiquement sur Netlify à chaque push sur la branche `main`.


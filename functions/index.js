const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.monitorarQualquerPedido = functions.firestore
    .document('{colecao}/{documentoId}')
    .onCreate(async (snap, context) => {
        const path = context.resource.name;
        // Filtramos para ignorar logs desnecessários, focando apenas em coleções de pedidos
        if (path.includes('orders') || path.includes('pedidos') || path.includes('orders')) {
            console.log("🔥 DOCUMENTO CRIADO!");
            console.log("📍 CAMINHO EXATO:", path);
            console.log("📦 DADOS:", JSON.stringify(snap.data()));
        }
        return null;
    });

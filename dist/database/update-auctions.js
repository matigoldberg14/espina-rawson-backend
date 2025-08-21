"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
async function updateAuctions() {
    try {
        console.log('🔄 Actualizando subastas existentes...');
        // Obtener todas las subastas
        const auctions = await prisma.auction.findMany();
        // Mapeo de títulos a tipos
        const typeMapping = {
            'Colección de Arte Contemporáneo': 'arte',
            'Propiedad en Recoleta': 'inmuebles',
            'Vehículos de Colección': 'vehiculos',
            'Maquinaria Agrícola de Alto Rendimiento': 'maquinaria',
            'Flota de Vehículos Comerciales': 'vehiculos',
            'Inmueble Industrial en Parque Patricios': 'inmuebles',
        };
        for (const auction of auctions) {
            const type = typeMapping[auction.title] || 'general';
            await prisma.auction.update({
                where: { id: auction.id },
                data: {
                    type,
                    mainImageUrl: auction.mainImageUrl || '/placeholder.svg?height=600&width=800',
                },
            });
            console.log(`✅ Actualizada subasta: ${auction.title} -> tipo: ${type}`);
        }
        console.log('✅ Todas las subastas han sido actualizadas');
    }
    catch (error) {
        console.error('❌ Error actualizando subastas:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
updateAuctions();
//# sourceMappingURL=update-auctions.js.map
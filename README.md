# N-Queens — PWA (PezzaliAPP)

Puzzle classico, **open-source**, con solver in **backtracking**.  
Piazza **N** regine su una scacchiera **N×N** senza conflitti su righe, colonne, diagonali.

## ✨ Funzioni
- Interfaccia interattiva con evidenza dei conflitti
- **Suggerisci** / **Risolvi (1)** / **Trova tutte** (fino a 256)
- **PWA**: installabile e **offline**

## 🚀 Deploy rapido
- Metti i file su un hosting statico (GitHub Pages/Netlify/Vercel).  
- Apri `index.html`. Service Worker attivo su HTTPS o localhost.

## 📂 Struttura
```
N-Queens/
├─ index.html
├─ style.css
├─ script.js
├─ manifest.json
├─ service-worker.js
├─ icons/
│  ├─ icon-192.png
│  ├─ icon-512.png
│  └─ favicon.ico
├─ README.md
└─ LICENSE
```

## 🧠 Note sul solver
Backtracking per riga, con controllo colonne/diagonali.  
`Suggerisci` completa la prossima riga compatibile con la posizione corrente.

## 📜 Licenza
MIT © 2025 Alessandro Pezzali — PezzaliAPP
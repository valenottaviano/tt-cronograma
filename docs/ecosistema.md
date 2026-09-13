# Ecosistema Grupo TT

La vista completa del sistema —esta app, `roberto-parodi`, `tt-comercios`, y cómo
se hablan— vive en el repo del panel, para no mantener copias que se
desincronicen:

**`roberto-parodi/docs/ECOSISTEMA.md`**

Cubre:

- Quién es dueño de qué dato (esta app lee de cuatro fuentes distintas)
- Comercios, beneficios y ventas: `roberto-parodi/docs/MERCHANTS.md`
- El modelo de datos del panel del coach y el ciclo de vida de una planilla
- Cómo funciona la sesión del atleta y por qué el JWT nunca llega al navegador
- El mapa completo de endpoints entre las tres aplicaciones
- Qué se rompe si se cae cada pieza
- Las trampas del sistema (los dos lockfiles, los proxies de archivos, qué
  quedó legacy)

Docs propios de este repo:

| Tema | Archivo |
|---|---|
| Flujo de ingreso al grupo | [`sumate.md`](./sumate.md) |
| Preguntas frecuentes | [`faq.md`](./faq.md) |
| API del atleta (copia de referencia) | [`ATHLETE_API.md`](./ATHLETE_API.md) |

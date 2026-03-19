# Ahora o Nunca

## Flujo de trabajo con agentes

El proyecto usa un sistema multi-agente con roles especializados:

| Agente | Modelo | Rol |
|--------|--------|-----|
| researcher | Opus | Investiga antes de implementar: docs, SDKs, issues conocidos. Crea plan en `docs/` |
| implementer | Sonnet | Ejecuta el plan paso a paso. Lee de `docs/`, no improvisa. Tiene Figma MCP |
| tester | Haiku | Traduce el test plan del researcher a codigo. No decide que testear |
| fixer | Sonnet | Diagnostica y arregla bugs con analisis de impacto |
| explorer | Haiku | Solo lectura. Responde preguntas rapidas sobre el codebase |

### Flujo recomendado

```
researcher (Opus) → /clear → implementer (Sonnet) → /clear → tester (Haiku)
```

1. **researcher** investiga y crea el plan en `docs/`
2. `/clear` para limpiar contexto
3. **implementer** lee el plan y ejecuta la implementacion
4. `/clear` para limpiar contexto
5. **tester** lee el test plan y escribe los tests

Si hay bugs: **fixer** diagnostica y arregla.
Para preguntas rapidas: **explorer** responde sin modificar nada.

## Reglas generales

- Los planes siempre van en `docs/`
- El implementer NUNCA improvisa, sigue el plan del researcher
- El tester NUNCA decide que testear, sigue el test plan
- El explorer NUNCA modifica archivos

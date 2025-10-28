#!/bin/bash
# ==========================================================
# IQS ZAP — Firestore Setup via REST API
# ==========================================================

PROJECT_ID="jaime-6bad7"
API_KEY="AIzaSyCkc5vnWLI6iiWGEBjT3KY_2JERziChLos"

# ==========================================================
# 1. Cria documento em iqsTokens (coleção de tokens únicos)
# ==========================================================
curl -X PATCH \
  "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/iqsTokens/token123?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "valid": {"booleanValue": true},
      "used": {"booleanValue": false},
      "surveyId": {"stringValue": "survey001"},
      "department": {"stringValue": "RH"},
      "createdAt": {"timestampValue": "2025-10-27T00:00:00Z"},
      "expiresAt": {"timestampValue": "2025-11-27T00:00:00Z"},
      "emailHash": {"stringValue": "b1a4f3d9f7b8a21e"}
    }
  }'

echo "✅ Criado documento em iqsTokens/token123"

# ==========================================================
# 2. Cria documento em iqsSurveys (definição de formulário)
# ==========================================================
curl -X PATCH \
  "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/iqsSurveys/survey001?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "title": {"stringValue": "Inquérito de Satisfação RH"},
      "department": {"stringValue": "RH"},
      "description": {"stringValue": "Avaliação da satisfação dos colaboradores com o departamento de Recursos Humanos."},
      "headerImageUrl": {"stringValue": "https://example.com/banner_rh.jpg"},
      "createdAt": {"timestampValue": "2025-10-27T08:00:00Z"},
      "questions": {
        "arrayValue": {
          "values": [
            {"mapValue": {"fields": {"id": {"stringValue": "q1"}, "label": {"stringValue": "Como avalia o atendimento?"}, "type": {"stringValue": "likert"}, "required": {"booleanValue": true}}}},
            {"mapValue": {"fields": {"id": {"stringValue": "q2"}, "label": {"stringValue": "Foi atendido com rapidez?"}, "type": {"stringValue": "likert"}}}},
            {"mapValue": {"fields": {"id": {"stringValue": "q3"}, "label": {"stringValue": "O atendimento foi cortês?"}, "type": {"stringValue": "likert"}}}},
            {"mapValue": {"fields": {"id": {"stringValue": "q10_open"}, "label": {"stringValue": "Comentários adicionais"}, "type": {"stringValue": "text"}, "maxLength": {"integerValue": 250}}}}
          ]
        }
      }
    }
  }'

echo "✅ Criado documento em iqsSurveys/survey001"

# ==========================================================
# 3. Cria documento em iqsResponses (respostas anônimas)
# ==========================================================
curl -X POST \
  "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/iqsResponses?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "token": {"stringValue": "token123"},
      "surveyId": {"stringValue": "survey001"},
      "answers": {
        "mapValue": {
          "fields": {
            "q1": {"stringValue": "Excelente"},
            "q2": {"stringValue": "Sim"},
            "q3": {"stringValue": "Regular"},
            "q10_open": {"stringValue": "Poderia melhorar o atendimento"}
          }
        }
      },
      "createdAt": {"timestampValue": "2025-10-27T10:00:00Z"}
    }
  }'

echo "✅ Criado documento em iqsResponses"

# ==========================================================
# 4. (Opcional) Lista documentos criados para verificação
# ==========================================================
curl -X GET \
  "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/iqsTokens?key=$API_KEY"

curl -X GET \
  "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/iqsSurveys?key=$API_KEY"

curl -X GET \
  "https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/iqsResponses?key=$API_KEY"

echo "🚀 Setup concluído com sucesso!"

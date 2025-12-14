# Retell AI Integration

This document explains how the HumanTruths Interview Platform integrates with Retell AI for voice interviews.

## Overview

We use Retell AI's **Conversation Flow with Blocks** to create structured voice interviews that:
1. Ask screening questions
2. Branch based on responses
3. Extract structured data from conversations

## Conversation Flow Architecture

```
┌─────────────────┐
│  Welcome Node   │
│  "Are you a     │
│   woman?"       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   Yes        No
    │         │
    ▼         ▼
┌─────────┐  ┌─────────┐
│ Extract │  │End Call │
│is_woman │  │"Thank   │
│ = true  │  │ you!"   │
└────┬────┘  └─────────┘
     │
     ▼
┌─────────────────┐
│ Main Question   │
│ "What's your    │
│ favorite food   │
│ and why?"       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Extract         │
│ favorite_food   │
│ food_reason     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ End Call        │
│ "Thank you for  │
│ sharing!"       │
└─────────────────┘
```

## Extract Dynamic Variables

We use Retell's [Extract Dynamic Variables](https://docs.retellai.com/build/single-multi-prompt/extract-dv) feature to capture structured data from the conversation.

### Variables Extracted

| Variable | Type | Description |
|----------|------|-------------|
| `is_woman` | boolean | Whether the user identifies as a woman |
| `favorite_food` | string | The user's favorite food |
| `food_reason` | string | Why it's their favorite food |

### How It Works

1. **Conversation Flow** defines extraction points using `extract_dynamic_variables` nodes
2. **Retell AI** uses the LLM to extract values based on conversation context
3. **Webhook** receives `collected_dynamic_variables` in the `call_analyzed` event
4. **Our API** stores these in the `extracted_variables` JSON column

### Webhook Payload Example

```json
{
  "event": "call_analyzed",
  "call": {
    "call_id": "call_abc123",
    "collected_dynamic_variables": {
      "is_woman": "true",
      "favorite_food": "pizza",
      "food_reason": "because I like Italian food",
      "previous_node": "Extract Variables",
      "current_node": "End Call"
    }
  }
}
```

### Important Notes

- **Boolean handling**: Retell sends `is_woman: "true"` as a string, only when true. When false, the field is absent. Our Zod schema transforms this to a proper boolean.
- **Optional fields**: If the user doesn't reach certain nodes (e.g., ends call early), those variables won't be present.

## Webhook Integration

### Endpoint

```
POST /api/webhooks/retell
```

### Security

- HMAC signature validation using `Retell.verify()`
- API key stored in `RETELL_API_KEY` environment variable

### Events Processed

| Event | Action |
|-------|--------|
| `call_started` | Acknowledged, no action |
| `call_ended` | Save interview with transcript |
| `call_analyzed` | Update with extracted variables |

## Agent Configuration

The full agent configuration is available in [`retell-agent-config.json`](./retell-agent-config.json).

### Key Settings

- **Voice**: `11labs-Cimo`
- **Model**: `gpt-4.1` (cascading)
- **Max Duration**: 1 hour (3600000ms)
- **Language**: Multi-language support
- **Interruption Sensitivity**: 0.9 (high)

## References

- [Retell AI Documentation](https://docs.retellai.com/)
- [Conversation Flow Guide](https://docs.retellai.com/build/conversation-flow)
- [Extract Dynamic Variables](https://docs.retellai.com/build/single-multi-prompt/extract-dv)
- [Webhook Overview](https://docs.retellai.com/features/webhook-overview)

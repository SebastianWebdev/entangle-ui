import { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChatPanel } from './ChatPanel';
import { ChatMessageList } from './ChatMessageList';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatTypingIndicator } from './ChatTypingIndicator';
import { ChatToolCall } from './ChatToolCall';
import { ChatCodeBlock } from './ChatCodeBlock';
import { ChatContextChip } from './ChatContextChip';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatActionBar } from './ChatActionBar';
import { useChatMessages } from './useChatMessages';
import { Button } from '@/components/primitives/Button';
import { Text } from '@/components/primitives/Text';
import type { ChatMessageData, ChatAttachmentData } from './ChatPanel.types';

// ─── Helpers ─────────────────────────────────────────────────────

let nextId = 1;
function createMsg(
  role: ChatMessageData['role'],
  content: string,
  extras: Partial<ChatMessageData> = {}
): ChatMessageData {
  return {
    id: `msg-${nextId++}`,
    role,
    content,
    status: 'complete',
    timestamp: new Date().toISOString(),
    ...extras,
  };
}

// ─── Meta ────────────────────────────────────────────────────────

const meta: Meta<typeof ChatPanel> = {
  title: 'Editor/ChatPanel',
  component: ChatPanel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Compositional chat components for building AI assistant interfaces in editor applications. ' +
          "Transport-agnostic — components handle rendering only; API integration is the consumer's responsibility.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChatPanel>;

// ─── Empty ───────────────────────────────────────────────────────

export const Empty: Story = {
  render: () => (
    <div style={{ width: 400, height: 500 }}>
      <ChatPanel>
        <ChatMessageList
          messages={[]}
          emptyState={
            <ChatEmptyState
              title="AI Assistant"
              description="Ask me anything about your scene."
              suggestions={[
                'Explain selected nodes',
                'Optimize materials',
                'Fix errors',
              ]}
              onSuggestionClick={s => alert(`Selected: ${s}`)}
            />
          }
        />
        <ChatInput placeholder="Ask about your project..." />
      </ChatPanel>
    </div>
  ),
};

// ─── Conversation ────────────────────────────────────────────────

const conversationMessages: ChatMessageData[] = [
  createMsg(
    'user',
    'Can you help me optimize the material on the selected cube?'
  ),
  createMsg(
    'assistant',
    'I can see you have a Standard PBR material with several texture maps. Here are some suggestions:\n\n1. Combine your roughness and metallic maps into a single channel-packed texture\n2. Reduce the albedo texture resolution from 4K to 2K — at the current viewport distance the difference is imperceptible\n3. Enable texture streaming for the normal map'
  ),
  createMsg('user', 'Sounds good. Can you apply the first suggestion?'),
  createMsg(
    'assistant',
    "Done! I've packed the roughness (R channel) and metallic (B channel) into a single texture. The material now uses 2 texture slots instead of 3."
  ),
  createMsg('system', 'Material updated successfully.', {
    status: 'complete',
  }),
];

export const Conversation: Story = {
  render: () => (
    <div style={{ width: 400, height: 500 }}>
      <ChatPanel>
        <ChatMessageList
          messages={conversationMessages}
          renderMessage={msg => (
            <ChatMessage key={msg.id} message={msg} showAvatar showTimestamp />
          )}
        />
        <ChatInput placeholder="Ask about your project..." />
      </ChatPanel>
    </div>
  ),
};

// ─── Streaming ───────────────────────────────────────────────────

export const Streaming: Story = {
  render: () => {
    const StreamingDemo = () => {
      const chat = useChatMessages({
        initialMessages: [
          createMsg('user', 'Explain how PBR rendering works'),
          createMsg(
            'assistant',
            'Physically Based Rendering (PBR) is a rendering approach that simulates how light interacts with surfaces in a physically accurate way. It uses...',
            { status: 'streaming' }
          ),
        ],
      });

      return (
        <div style={{ width: 400, height: 500 }}>
          <ChatPanel>
            <ChatMessageList
              messages={chat.messages}
              renderMessage={msg => (
                <ChatMessage key={msg.id} message={msg} showAvatar />
              )}
            />
            <ChatTypingIndicator visible label="Generating..." />
            <ChatInput
              streaming
              onStop={() => alert('Stop clicked')}
              placeholder="Ask about your project..."
            />
          </ChatPanel>
        </div>
      );
    };

    return <StreamingDemo />;
  },
};

// ─── Tool Calls ──────────────────────────────────────────────────

export const ToolCalls: Story = {
  render: () => {
    const messages: ChatMessageData[] = [
      createMsg('user', 'Create 3 spheres in a row'),
      createMsg(
        'assistant',
        "I'll create 3 spheres positioned along the X axis.",
        {
          toolCalls: [
            {
              id: 'tc-1',
              name: 'create_nodes',
              status: 'completed',
              input: { type: 'sphere', count: 3, spacing: 2.0 },
              output: { nodeIds: ['sphere_1', 'sphere_2', 'sphere_3'] },
              durationMs: 145,
            },
          ],
        }
      ),
      createMsg('assistant', 'Created 3 sphere nodes in the scene.', {
        toolCalls: [
          {
            id: 'tc-2',
            name: 'set_transform',
            status: 'running',
            input: { targets: ['sphere_1', 'sphere_2', 'sphere_3'] },
          },
        ],
      }),
      createMsg('assistant', '', {
        toolCalls: [
          {
            id: 'tc-3',
            name: 'apply_material',
            status: 'error',
            input: { material: 'chrome' },
            error: 'Material "chrome" not found in asset library',
          },
        ],
      }),
    ];

    return (
      <div style={{ width: 400, height: 600 }}>
        <ChatPanel>
          <ChatMessageList
            messages={messages}
            renderMessage={msg => (
              <ChatMessage
                key={msg.id}
                message={msg}
                showAvatar
                actions={msg.toolCalls?.length ? undefined : undefined}
              >
                {msg.toolCalls?.map(tc => (
                  <ChatToolCall
                    key={tc.id}
                    toolCall={tc}
                    collapsible
                    renderOutput={output => (
                      <Text size="xs" color="muted">
                        Created {(output['nodeIds'] as string[]).length} nodes
                      </Text>
                    )}
                  />
                ))}
              </ChatMessage>
            )}
          />
          <ChatInput placeholder="Ask about your project..." />
        </ChatPanel>
      </div>
    );
  },
};

// ─── Code Blocks ─────────────────────────────────────────────────

export const CodeBlocks: Story = {
  render: () => {
    const pythonCode = `import bpy

# Create a new material
mat = bpy.data.materials.new(name="PBR_Chrome")
mat.use_nodes = True
nodes = mat.node_tree.nodes

# Set metallic and roughness
principled = nodes["Principled BSDF"]
principled.inputs["Metallic"].default_value = 1.0
principled.inputs["Roughness"].default_value = 0.15`;

    const messages: ChatMessageData[] = [
      createMsg('user', 'Show me Python code to create a chrome material'),
      createMsg('assistant', "Here's a Blender Python script:"),
    ];

    return (
      <div style={{ width: 480, height: 500 }}>
        <ChatPanel>
          <ChatMessageList
            messages={messages}
            renderMessage={msg => (
              <ChatMessage key={msg.id} message={msg} showAvatar />
            )}
          />
          <div style={{ padding: '0 8px 8px' }}>
            <ChatCodeBlock
              code={pythonCode}
              language="python"
              lineNumbers
              actions={
                <Button size="sm" variant="ghost">
                  Insert
                </Button>
              }
            />
            <ChatActionBar>
              <Button size="sm" variant="ghost">
                Copy
              </Button>
              <Button size="sm" variant="ghost">
                Apply to Scene
              </Button>
            </ChatActionBar>
          </div>
          <ChatInput placeholder="Ask about your project..." />
        </ChatPanel>
      </div>
    );
  },
};

// ─── With Attachments ────────────────────────────────────────────

export const WithAttachments: Story = {
  render: () => {
    const AttachmentsDemo = () => {
      const [attachments, setAttachments] = useState<ChatAttachmentData[]>([
        {
          id: 'a1',
          name: 'scene.blend',
          type: 'file',
          size: 2_400_000,
        },
        {
          id: 'a2',
          name: 'reference.png',
          type: 'image',
          thumbnailUrl:
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjNDQ0Ii8+PC9zdmc+',
        },
        {
          id: 'a3',
          name: 'vertex_shader.glsl',
          type: 'code',
          content: 'void main() { ... }',
        },
      ]);

      return (
        <div style={{ width: 400, height: 300 }}>
          <ChatPanel>
            <ChatInput
              attachments={attachments}
              onRemoveAttachment={id =>
                setAttachments(prev => prev.filter(a => a.id !== id))
              }
              prefix={
                <ChatContextChip
                  label="Selected"
                  items={['Cube', 'Sphere', 'Light']}
                  onDismiss={() => alert('Context dismissed')}
                />
              }
              placeholder="Ask about your selection..."
            />
          </ChatPanel>
        </div>
      );
    };

    return <AttachmentsDemo />;
  },
};

// ─── Compact Density ─────────────────────────────────────────────

export const CompactDensity: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: 600, height: 280 }}>
      <ChatPanel density="compact">
        <ChatMessageList
          messages={[
            createMsg('user', 'What material is on the cube?'),
            createMsg(
              'assistant',
              'The selected cube uses a Standard PBR material with roughness 0.45 and metallic 0.0.'
            ),
          ]}
          renderMessage={msg => <ChatMessage key={msg.id} message={msg} />}
        />
        <ChatInput placeholder="Ask about your project..." maxLines={3} />
      </ChatPanel>
    </div>
  ),
};

// ─── Error State ─────────────────────────────────────────────────

export const ErrorState: Story = {
  render: () => {
    const messages: ChatMessageData[] = [
      createMsg('user', 'Generate a procedural texture'),
      createMsg(
        'assistant',
        'I encountered an error while generating the texture. The GPU shader compilation failed.',
        { status: 'error' }
      ),
    ];

    return (
      <div style={{ width: 400, height: 400 }}>
        <ChatPanel>
          <ChatMessageList
            messages={messages}
            renderMessage={msg => (
              <ChatMessage
                key={msg.id}
                message={msg}
                showAvatar
                actions={
                  msg.status === 'error' ? (
                    <ChatActionBar>
                      <Button size="sm" variant="ghost">
                        Retry
                      </Button>
                    </ChatActionBar>
                  ) : undefined
                }
              />
            )}
          />
          <ChatInput placeholder="Ask about your project..." />
        </ChatPanel>
      </div>
    );
  },
};

// ─── Full Integration ────────────────────────────────────────────

export const FullIntegration: Story = {
  render: () => {
    const FullDemo = () => {
      const chat = useChatMessages();
      const [isStreaming, setIsStreaming] = useState(false);

      const handleSend = useCallback(
        (text: string) => {
          const userMsg = createMsg('user', text);
          chat.appendMessage(userMsg);

          // Simulate assistant response
          const assistantMsg = createMsg('assistant', '', {
            status: 'streaming',
          });
          chat.appendMessage(assistantMsg);
          setIsStreaming(true);

          // Simulate streaming tokens
          const response =
            'This is a simulated response. In a real app, this would come from an LLM API via SSE, WebSocket, or REST streaming.';
          let idx = 0;
          const interval = setInterval(() => {
            if (idx < response.length) {
              const chunk = response.slice(idx, idx + 3);
              chat.updateMessage(assistantMsg.id, prev => ({
                content: prev.content + chunk,
              }));
              idx += 3;
            } else {
              clearInterval(interval);
              chat.updateMessage(assistantMsg.id, { status: 'complete' });
              setIsStreaming(false);
            }
          }, 50);
        },
        [chat]
      );

      return (
        <div style={{ width: 400, height: 500 }}>
          <ChatPanel>
            <ChatMessageList
              messages={chat.messages}
              renderMessage={msg => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  showAvatar
                  showTimestamp
                  actions={
                    msg.role === 'assistant' && msg.status === 'complete' ? (
                      <ChatActionBar>
                        <Button size="sm" variant="ghost">
                          Copy
                        </Button>
                        <Button size="sm" variant="ghost">
                          Apply
                        </Button>
                      </ChatActionBar>
                    ) : undefined
                  }
                />
              )}
              emptyState={
                <ChatEmptyState
                  title="AI Assistant"
                  description="Ask me anything about your scene."
                  suggestions={[
                    'Explain selected nodes',
                    'Optimize materials',
                    'Fix errors',
                  ]}
                  onSuggestionClick={handleSend}
                />
              }
            />
            <ChatTypingIndicator visible={isStreaming} />
            <ChatInput
              onSubmit={text => handleSend(text)}
              onStop={() => setIsStreaming(false)}
              streaming={isStreaming}
              placeholder="Ask about your project..."
            />
          </ChatPanel>
        </div>
      );
    };

    return <FullDemo />;
  },
};

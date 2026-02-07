import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  timestamp: Date;
}

const STYLES = [
  { value: 'vintage', label: '🎨 Винтажный' },
  { value: 'modern', label: '✨ Современный' },
  { value: 'watercolor', label: '🖌️ Акварель' },
  { value: 'cyberpunk', label: '🤖 Киберпанк' },
  { value: 'minimalist', label: '⚪ Минимализм' },
];

export default function Index() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('vintage');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<GeneratedImage | null>(null);
  const [activeTab, setActiveTab] = useState('generator');

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    setTimeout(() => {
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: `https://picsum.photos/seed/${Date.now()}/800/800`,
        prompt: prompt,
        style: selectedStyle,
        timestamp: new Date(),
      };
      
      setImages(prev => [newImage, ...prev]);
      setIsGenerating(false);
      setActiveTab('gallery');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-bold text-foreground tracking-tight">
            Генератор изображений
          </h1>
          <p className="text-muted-foreground text-lg">
            Создавайте неограниченное количество уникальных изображений
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="generator" className="text-base">
              <Icon name="Sparkles" size={18} className="mr-2" />
              Генератор
            </TabsTrigger>
            <TabsTrigger value="gallery" className="text-base">
              <Icon name="Images" size={18} className="mr-2" />
              Галерея ({images.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-8">
            <Card className="max-w-3xl mx-auto p-8 shadow-lg border-0">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Опишите желаемое изображение
                  </label>
                  <Input
                    placeholder="Например: закат над океаном с парусником..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="text-base h-12"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Стиль изображения
                  </label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value} className="text-base">
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full h-14 text-lg font-medium"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                      Генерируем...
                    </>
                  ) : (
                    <>
                      <Icon name="Wand2" size={20} className="mr-2" />
                      Сгенерировать
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {images.length > 0 && (
              <div className="max-w-3xl mx-auto">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Последняя генерация
                </h3>
                <Card
                  className="overflow-hidden cursor-pointer transition-all hover:shadow-xl border-0"
                  onClick={() => setFullscreenImage(images[0])}
                >
                  <img
                    src={images[0].url}
                    alt={images[0].prompt}
                    className="w-full h-auto"
                  />
                  <div className="p-4 bg-white">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {images[0].prompt}
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="gallery">
            {images.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <Icon name="ImageOff" size={64} className="mx-auto text-muted-foreground/30" />
                <p className="text-muted-foreground text-lg">
                  Пока нет созданных изображений
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('generator')}
                  className="mt-4"
                >
                  <Icon name="Sparkles" size={18} className="mr-2" />
                  Создать первое изображение
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                  <Card
                    key={image.id}
                    className="overflow-hidden cursor-pointer group transition-all hover:shadow-xl border-0"
                    onClick={() => setFullscreenImage(image)}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Icon
                          name="Maximize2"
                          size={32}
                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-white space-y-2">
                      <p className="text-sm text-foreground line-clamp-2 font-medium">
                        {image.prompt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {STYLES.find((s) => s.value === image.style)?.label}
                        </span>
                        <span>
                          {image.timestamp.toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
          <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 overflow-hidden">
            {fullscreenImage && (
              <div className="flex flex-col h-full">
                <div className="flex-1 flex items-center justify-center bg-black/95 p-4">
                  <img
                    src={fullscreenImage.url}
                    alt={fullscreenImage.prompt}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="bg-white p-6 space-y-2">
                  <p className="text-lg font-medium text-foreground">
                    {fullscreenImage.prompt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Icon name="Palette" size={16} />
                      {STYLES.find((s) => s.value === fullscreenImage.style)?.label}
                    </span>
                    <span className="flex items-center gap-2">
                      <Icon name="Clock" size={16} />
                      {fullscreenImage.timestamp.toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

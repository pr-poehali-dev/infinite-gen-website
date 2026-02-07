import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
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
  { value: 'anime', label: '🎌 Аниме' },
  { value: 'oil-painting', label: '🖼️ Масляная живопись' },
  { value: 'sketch', label: '✏️ Скетч' },
  { value: 'abstract', label: '🌈 Абстракция' },
  { value: '3d', label: '🎮 3D рендер' },
];

const API_URL = 'https://functions.poehali.dev/d916c5fd-9afd-4c10-b043-a6da6bd0aa5e';

export default function Index() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [lastImage, setLastImage] = useState<GeneratedImage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<GeneratedImage | null>(null);
  const [activeTab, setActiveTab] = useState('generator');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, загрузите изображение',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      const base64Data = base64String.split(',')[1];
      setUploadedImage(base64Data);
      setUploadedImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите описание изображения',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          style: selectedStyle,
          inputImage: uploadedImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка генерации');
      }

      if (data.success && data.imageUrl) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: data.imageUrl,
          prompt: prompt,
          style: selectedStyle,
          timestamp: new Date(),
        };

        setLastImage(newImage);
        setActiveTab('gallery');

        toast({
          title: 'Успешно!',
          description: 'Изображение создано',
        });

        handleRemoveImage();
        setPrompt('');
      } else {
        throw new Error('Не удалось получить изображение');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Ошибка генерации',
        description: error instanceof Error ? error.message : 'Попробуйте ещё раз',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors">
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsDark(!isDark)}
          className="rounded-full"
        >
          <Icon name={isDark ? 'Sun' : 'Moon'} size={20} />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Icon name="Sparkles" size={40} className="text-primary" />
          </div>
          <h1 className="text-7xl font-bold text-foreground tracking-tight">
            IIUYTA
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            AI генератор изображений с бесконечными возможностями
          </p>
          <a
            href="https://t.me/IIUYTA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium"
          >
            <Icon name="Send" size={20} />
            Наш Telegram канал
          </a>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 h-12">
            <TabsTrigger value="generator" className="text-base">
              <Icon name="Wand2" size={18} className="mr-2" />
              Генератор
            </TabsTrigger>
            <TabsTrigger value="gallery" className="text-base">
              <Icon name="Image" size={18} className="mr-2" />
              Галерея
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-8">
            <Card className="max-w-3xl mx-auto p-8 shadow-xl border">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Icon name="MessageSquare" size={16} />
                    Описание изображения
                  </label>
                  <Input
                    placeholder="Например: космический корабль на орбите красной планеты..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="text-base h-12"
                    onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Icon name="Palette" size={16} />
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

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Icon name="Upload" size={16} />
                    Загрузить изображение для редактирования (опционально)
                  </label>

                  {uploadedImagePreview ? (
                    <div className="relative">
                      <img
                        src={uploadedImagePreview}
                        alt="Uploaded"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        onClick={handleRemoveImage}
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        <Icon name="X" size={16} />
                      </Button>
                      <div className="mt-2 text-xs text-muted-foreground">
                        AI изменит это изображение согласно вашему описанию
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    >
                      <Icon name="ImagePlus" size={48} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Нажмите для загрузки изображения
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
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
                      Генерируем изображение...
                    </>
                  ) : (
                    <>
                      <Icon name="Sparkles" size={20} className="mr-2" />
                      {uploadedImage ? 'Изменить изображение' : 'Сгенерировать'}
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {lastImage && (
              <div className="max-w-3xl mx-auto">
                <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                  <Icon name="Zap" size={20} />
                  Последняя генерация
                </h3>
                <Card
                  className="overflow-hidden cursor-pointer transition-all hover:shadow-2xl border group"
                  onClick={() => setFullscreenImage(lastImage)}
                >
                  <div className="relative">
                    <img
                      src={lastImage.url}
                      alt={lastImage.prompt}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                      <Icon
                        name="Expand"
                        size={48}
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-card">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {lastImage.prompt}
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="gallery">
            {!lastImage ? (
              <div className="text-center py-16 space-y-4">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted/50 mb-4">
                  <Icon name="ImageOff" size={48} className="text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground text-lg font-medium">
                  Галерея пуста
                </p>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Создайте своё первое изображение с помощью AI
                </p>
                <Button
                  onClick={() => setActiveTab('generator')}
                  className="mt-4"
                  size="lg"
                >
                  <Icon name="Sparkles" size={18} className="mr-2" />
                  Начать создание
                </Button>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <Card
                  className="overflow-hidden cursor-pointer group transition-all hover:shadow-2xl border"
                  onClick={() => setFullscreenImage(lastImage)}
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={lastImage.url}
                      alt={lastImage.prompt}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <Icon
                          name="Maximize2"
                          size={24}
                          className="text-white mx-auto drop-shadow-lg"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-card space-y-3">
                    <p className="text-base text-foreground font-medium">
                      {lastImage.prompt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Icon name="Palette" size={16} />
                        {STYLES.find((s) => s.value === lastImage.style)?.label}
                      </span>
                      <span className="flex items-center gap-2">
                        <Icon name="Clock" size={16} />
                        {lastImage.timestamp.toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {fullscreenImage && (
          <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
            <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 overflow-hidden">
              <div className="flex flex-col h-full bg-black">
                <div className="flex-1 flex items-center justify-center p-4">
                  <img
                    src={fullscreenImage.url}
                    alt={fullscreenImage.prompt}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="bg-card p-6 space-y-3 border-t">
                  <p className="text-lg font-semibold text-foreground">
                    {fullscreenImage.prompt}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Icon name="Palette" size={16} />
                      {STYLES.find((s) => s.value === fullscreenImage.style)?.label}
                    </span>
                    <span className="flex items-center gap-2">
                      <Icon name="Calendar" size={16} />
                      {fullscreenImage.timestamp.toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

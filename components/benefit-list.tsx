import { Benefit } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info, Instagram, MessageCircle } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BenefitListProps {
  benefits: Benefit[];
}

export function BenefitList({ benefits }: BenefitListProps) {
  if (benefits.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay beneficios disponibles por el momento.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
      {benefits.map((benefit) => (
        <Card
          key={benefit.id}
          className="flex flex-row md:flex-col h-full overflow-hidden hover:border-primary/50 transition-colors py-4 md:py-6 gap-4 md:gap-6"
        >
          {benefit.logo && (
            <div className="relative w-28 h-28 md:w-full md:h-48 p-3 md:p-4 flex-shrink-0 flex items-center justify-center bg-white border-b md:border-b transition-colors rounded-lg md:rounded-none">
              <div className="relative w-full h-full">
                <Image
                  src={benefit.logo}
                  alt={benefit.company}
                  fill
                  className="object-contain p-2"
                />
              </div>
            </div>
          )}
          <div className="flex flex-col flex-1 min-w-0">
            <CardHeader className="p-0 md:p-6 md:pb-2">
              <CardTitle className="text-sm md:text-xl">
                {benefit.title}
              </CardTitle>
              <p className="text-[11px] md:text-sm text-muted-foreground font-medium">
                {benefit.company}
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-2 px-0 pt-1 pb-0 md:p-6 md:pt-0">
              <p className="text-[12px] leading-snug md:text-sm text-muted-foreground flex-1">
                {benefit.description}
              </p>

              {benefit.linkCta && (() => {
                const isUrl = benefit.linkCta.startsWith('http') || benefit.linkCta.startsWith('/') || benefit.linkCta.startsWith('www');
                
                if (isUrl) {
                  const href = benefit.linkCta.startsWith('www') ? `https://${benefit.linkCta}` : benefit.linkCta;
                  return (
                    <Button asChild variant="outline" size="sm" className="w-full mt-1 text-xs h-8 md:text-sm md:h-10">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Aprovechar <ExternalLink className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                      </a>
                    </Button>
                  );
                }

                return (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full mt-1 text-xs h-8 md:text-sm md:h-10">
                        Info <Info className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{benefit.title}</DialogTitle>
                        <p className="text-sm text-muted-foreground font-medium">
                          {benefit.company}
                        </p>
                      </DialogHeader>
                      <div className="flex flex-col gap-3 py-4">
                        {benefit.linkCta.split('\n').filter(line => line.trim() !== '').map((paragraph, index) => (
                          <p key={index} className="text-sm leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })()}

              {(benefit.instagramLink || benefit.whatsappLink) && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {benefit.instagramLink && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[120px] text-[11px] h-8 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-colors"
                    >
                      <a
                        href={benefit.instagramLink.startsWith('http') ? benefit.instagramLink : `https://${benefit.instagramLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="mr-2 h-3.5 w-3.5" /> Instagram
                      </a>
                    </Button>
                  )}
                  {benefit.whatsappLink && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[120px] text-[11px] h-8 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
                    >
                      <a
                        href={benefit.whatsappLink.startsWith('http') ? benefit.whatsappLink : `https://wa.me/${benefit.whatsappLink.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 h-3.5 w-3.5" /> WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}

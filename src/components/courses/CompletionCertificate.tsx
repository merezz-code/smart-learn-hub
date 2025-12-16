// src/components/courses/CompletionCertificate.tsx
import { Certificate } from '@/types/course';
import { Button } from '@/components/ui/button';
import { 
  Award, 
  Download, 
  Share2, 
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface CompletionCertificateProps {
  certificate: Certificate;
  courseName?: string;
}

export function CompletionCertificate({ 
  certificate, 
  courseName,
}: CompletionCertificateProps) {
  const handleDownload = async () => {
    if (certificate.pdfUrl) {
      window.open(certificate.pdfUrl, '_blank');
    } else {
      toast.info('Génération du PDF en cours...');
      // TODO: Implémenter la génération de PDF
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Certificat - ${certificate.courseName}`,
      text: `J'ai terminé le cours "${certificate.courseName}" avec un score de ${certificate.score}% !`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Partagé avec succès !');
      } catch (error) {
        // L'utilisateur a annulé le partage
      }
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier !');
    }
  };

  const handleLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificate.courseName)}&organizationId=ORGANIZATION_ID&issueYear=${certificate.issuedAt.getFullYear()}&issueMonth=${certificate.issuedAt.getMonth() + 1}`;
    window.open(linkedInUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Certificate Preview */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-12 text-center">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2" />
        
        {/* Certificate Content */}
        <div className="relative z-10 space-y-6">
          {/* Badge */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Award className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Certificat de Réussite
            </p>
            <h2 className="text-3xl font-bold gradient-text mb-4">
              {certificate.courseName || courseName}
            </h2>
          </div>

          {/* Student Name */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Ce certificat est décerné à
            </p>
            <p className="text-2xl font-bold">{certificate.studentName}</p>
          </div>

          {/* Details */}
          <div className="flex items-center justify-center gap-8 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Score obtenu</p>
              <p className="text-xl font-bold text-success">
                {Math.round(certificate.score)}%
              </p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div>
              <p className="text-muted-foreground mb-1">Date d'obtention</p>
              <p className="text-xl font-bold">
                {new Date(certificate.issuedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Verification Code */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Code de vérification
            </p>
            <p className="font-mono text-sm font-medium mt-1">
              {certificate.verificationCode}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Télécharger le PDF
        </Button>
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Partager
        </Button>
        <Button variant="outline" onClick={handleLinkedIn}>
          <ExternalLink className="w-4 h-4 mr-2" />
          LinkedIn
        </Button>
      </div>

      {/* Info Card */}
      <div className="card-base p-6 bg-muted/30">
        <div className="flex gap-4">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-medium">
              Félicitations pour l'obtention de votre certificat !
            </p>
            <p className="text-muted-foreground">
              Ce certificat atteste que vous avez complété avec succès le cours 
              "{certificate.courseName}". Vous pouvez le télécharger en PDF, 
              le partager sur les réseaux sociaux, ou l'ajouter à votre profil LinkedIn.
            </p>
            <p className="text-muted-foreground">
              Le code de vérification permet à toute personne de confirmer l'authenticité 
              de ce certificat.
            </p>
          </div>
        </div>
      </div>

      {/* Share Options */}
      <div className="card-base p-6">
        <h3 className="font-semibold mb-4">Partagez votre réussite</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            className="h-auto flex-col py-4"
            onClick={handleLinkedIn}
          >
            <div className="w-10 h-10 rounded-full bg-[#0077B5] flex items-center justify-center mb-2">
              <span className="text-white font-bold">in</span>
            </div>
            <span className="text-xs">LinkedIn</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto flex-col py-4"
            onClick={() => {
              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`J'ai obtenu mon certificat pour le cours "${certificate.courseName}" avec un score de ${certificate.score}% ! 🎓`)}&url=${encodeURIComponent(window.location.href)}`;
              window.open(twitterUrl, '_blank');
            }}
          >
            <div className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center mb-2">
              <span className="text-white font-bold">𝕏</span>
            </div>
            <span className="text-xs">Twitter</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto flex-col py-4"
            onClick={() => {
              const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
              window.open(facebookUrl, '_blank');
            }}
          >
            <div className="w-10 h-10 rounded-full bg-[#4267B2] flex items-center justify-center mb-2">
              <span className="text-white font-bold">f</span>
            </div>
            <span className="text-xs">Facebook</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto flex-col py-4"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Lien copié !');
            }}
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-xs">Copier le lien</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
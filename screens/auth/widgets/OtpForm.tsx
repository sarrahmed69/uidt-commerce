"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import OtpInput from "../components/OtpInput";
import AuthLayout from "../layout/AuthLayout";
import { useRouter } from "next-nprogress-bar";
import { useConfirmOtp } from "@/features/auth/confirm-otp";
import { useResendOtp } from "@/features/auth/resend-otp";
import { createClient } from "@/lib/supabase/client";

interface OtpFormData {
  otp: string;
}

const OtpForm: React.FC = () => {
  const confirmOTP = useConfirmOtp();
  const resendOTP = useResendOtp();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email);
    });
  }, []);

  const onOtpSubmit = async (data: OtpFormData) => {
    const id = toast.loading("Vérification en cours...");
    try {
      const response = await confirmOTP.mutateAsync(data);
      if (response?.success) {
        toast.success("Compte vérifié avec succès !");
        router.push("/user/dashboard");
      } else {
        toast.error(response?.message || "Code invalide. Veuillez réessayer.");
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      toast.done(id);
    }
  };

  const onOtpResend = async () => {
    const id = toast.loading("Renvoi du code...");
    try {
      const response = await resendOTP.mutateAsync();
      if (response?.success) {
        toast.success(response.message || "Code renvoyé avec succès !");
      } else {
        toast.error(response?.message || "Échec du renvoi. Veuillez réessayer.");
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      toast.done(id);
    }
  };

  interface FormSubmissionEvent extends React.FormEvent<HTMLFormElement> {
    currentTarget: HTMLFormElement & {
      elements: { otp: HTMLInputElement };
    };
  }

  const FormSubmission = (e: FormSubmissionEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const otpValues = Array.from(formData.entries())
      .filter(([key]) => key.startsWith("otp-"))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value)
      .join("");

    if (otpValues.length < 6) {
      return toast.error("Code invalide. Veuillez réessayer.");
    }
    onOtpSubmit({ otp: otpValues });
  };

  return (
    <AuthLayout
      title="Vérifier le compte"
      subtitle="Entrez le code OTP envoyé à votre adresse e-mail"
    >
      <form className="max-w-96 w-full mt-4" onSubmit={FormSubmission}>
        <OtpInput
          onOtpSubmit={(otp: string) => onOtpSubmit({ otp })}
          length={6}
        />
        <div className="text-xs text-center mt-4">
          <span suppressHydrationWarning>
            Entrez le code à 6 chiffres envoyé à {userEmail}
          </span>
        </div>
        <div className="flex flex-col justify-center items-center mt-4">
          <button
            disabled={resendOTP.isPending || confirmOTP.isPending}
            type="submit"
            className="bg-primary text-white hover:bg-accent w-full h-11 rounded-md text-sm flex justify-center items-center gap-x-3 transition-colors"
          >
            Vérifier
          </button>
          <div className="flex items-center justify-center gap-x-4 text-sm mt-4">
            <span>Vous n&apos;avez pas reçu le code ? </span>
            <button
              onClick={() => onOtpResend()}
              disabled={resendOTP.isPending || confirmOTP.isPending}
              type="button"
              className="text-primary font-medium underline"
            >
              Renvoyer
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default OtpForm;

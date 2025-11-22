import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubmitLegalRequest } from "@/hooks/useLegal";
import { Loader2, Send, FileText } from "lucide-react";
import type { LegalRequestType } from "@/types/legal";

const legalRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  request_type: z.enum(["data-deletion", "data-export", "privacy-inquiry", "other"]),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type LegalRequestFormData = z.infer<typeof legalRequestSchema>;

interface LegalRequestFormProps {
  onSuccess?: () => void;
}

const REQUEST_TYPE_OPTIONS: { value: LegalRequestType; label: string; description: string }[] = [
  {
    value: "data-deletion",
    label: "Data Deletion",
    description: "Request to delete your personal data",
  },
  {
    value: "data-export",
    label: "Data Export",
    description: "Request a copy of your personal data",
  },
  {
    value: "privacy-inquiry",
    label: "Privacy Inquiry",
    description: "Questions about our privacy practices",
  },
  {
    value: "other",
    label: "Other",
    description: "Other legal or privacy-related requests",
  },
];

export function LegalRequestForm({ onSuccess }: LegalRequestFormProps) {
  const submitRequest = useSubmitLegalRequest();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<LegalRequestFormData>({
    resolver: zodResolver(legalRequestSchema),
    defaultValues: {
      request_type: "privacy-inquiry",
    },
  });

  const selectedRequestType = watch("request_type");

  const onSubmit = async (data: LegalRequestFormData) => {
    try {
      await submitRequest.mutateAsync({
        name: data.name,
        email: data.email,
        request_type: data.request_type,
        message: data.message,
        user_id: null, // Anonymous submission
      });
      reset();
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#F6D365]" />
          <CardTitle>Contact for Legal Requests</CardTitle>
        </div>
        <CardDescription>
          Submit a request regarding your data, privacy, or legal matters. We'll
          review and respond to your request as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#F3F4F6] mb-2"
            >
              Full Name <span className="text-[#F87171]">*</span>
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name")}
              className={errors.name ? "border-[#F87171]" : ""}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-[#F87171]">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#F3F4F6] mb-2"
            >
              Email Address <span className="text-[#F87171]">*</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              {...register("email")}
              className={errors.email ? "border-[#F87171]" : ""}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-[#F87171]">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="request_type"
              className="block text-sm font-medium text-[#F3F4F6] mb-2"
            >
              Request Type <span className="text-[#F87171]">*</span>
            </label>
            <Select
              value={selectedRequestType}
              onValueChange={(value) =>
                setValue("request_type", value as LegalRequestType, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger
                id="request_type"
                className={errors.request_type ? "border-[#F87171]" : ""}
              >
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-[#A1A1AA]">
                        {option.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.request_type && (
              <p className="mt-1 text-sm text-[#F87171]">
                {errors.request_type.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-[#F3F4F6] mb-2"
            >
              Message <span className="text-[#F87171]">*</span>
            </label>
            <Textarea
              id="message"
              placeholder="Please provide details about your request..."
              rows={6}
              {...register("message")}
              className={errors.message ? "border-[#F87171]" : ""}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-[#F87171]">
                {errors.message.message}
              </p>
            )}
            <p className="mt-1 text-xs text-[#A1A1AA]">
              Include any relevant details that will help us process your request
              efficiently.
            </p>
          </div>

          <Button
            type="submit"
            disabled={submitRequest.isPending}
            className="w-full bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
          >
            {submitRequest.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

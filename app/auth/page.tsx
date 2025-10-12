"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useAuth } from "@/components/auth-context"
import { fetchApi } from "@/lib/api"

// 로그인 폼 유효성 검사 스키마
const loginSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 형식을 입력해주세요." }),
  password: z.string().min(1, { message: "비밀번호를 입력해주세요." }),
})

// 회원가입 폼 유효성 검사 스키마
const signUpSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 형식을 입력해주세요." }),
  password: z.string().min(8, { message: "비밀번호는 8자 이상이어야 합니다." }),
  confirmPassword: z.string(),
  username: z.string().min(2, { message: "사용자 이름은 2자 이상이어야 합니다." })
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
})

// ID 중복 확인을 위한 상태 타입
type IdCheckState = {
  message: string
  isAvailable: boolean
} | null

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [idCheck, setIdCheck] = useState<IdCheckState>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(isLogin ? loginSchema : signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
    },
  })

  // 이메일 중복 확인 핸들러 (POST 방식으로 수정)
  const handleCheckEmail = async () => {
    const email = form.getValues("email");
    const isEmailValid = await form.trigger("email");

    if (!isEmailValid) {
        setIdCheck(null);
        return;
    }

    try {
      // API 요청 방식을 POST로 변경하고, 이메일을 body에 담아 전송
      const response = await fetchApi(`https://api.herehear.p-e.kr/auth/check-email`, {
        method: 'POST',
        body: JSON.stringify({ email: email }),
      })
      
      if (response.ok) {
        setIdCheck({ message: "사용 가능한 이메일입니다.", isAvailable: true });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setIdCheck({
          message: `오류: ${errorData.message || `상태 코드 ${response.status}`}`,
          isAvailable: false
        });
      }
    } catch (error) {
      console.error("이메일 중복 확인 오류:", error);
      setIdCheck({ message: "네트워크 오류 또는 서버에 연결할 수 없습니다.", isAvailable: false });
    }
  }

  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("email", e.target.value)
    if (idCheck) {
        setIdCheck(null)
    }
  }

  const toggleForm = () => {
    setIsLogin(!isLogin)
    form.reset()
    setIdCheck(null)
  }
  
  const onSubmit = async (values: z.infer<typeof loginSchema | typeof signUpSchema>) => {
    setIsLoading(true)
    form.clearErrors("root")

    if (isLogin) {
      try {
        const response = await fetchApi("https://api.herehear.p-e.kr/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: values.email, password: values.password }),
        })
        if (response.ok) {
          const data = await response.json()
          document.cookie = `accessToken=${data.accessToken}; path=/; max-age=86400;`
          login(data.accessToken)
        } else {
          const errorData = await response.json()
          form.setError("root", { message: errorData.message || "이메일 또는 비밀번호가 올바르지 않습니다." })
        }
      } catch (error) {
        form.setError("root", { message: "로그인 중 오류가 발생했습니다." })
      }
    } else { // 회원가입 로직
      if (!idCheck?.isAvailable) {
        form.setError("email", { message: "이메일 중복 확인을 완료해주세요." })
        setIsLoading(false)
        return
      }
      try {
        const signupValues = values as z.infer<typeof signUpSchema>
        const response = await fetchApi("https://api.herehear.p-e.kr/auth/signup", {
            method: "POST",
            body: JSON.stringify({
                email: signupValues.email,
                password: signupValues.password,
                username: signupValues.username,
            }),
        });

        if (response.ok) {
            alert("회원가입이 완료되었습니다! 로그인 해주세요.")
            setIsLogin(true)
            form.reset()
        } else {
            const errorData = await response.json();
            form.setError("root", { message: errorData.message || "회원가입에 실패했습니다." });
        }
      } catch (error) {
        form.setError("root", { message: "회원가입 중 오류가 발생했습니다." });
      }
    }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Image src="/logo.svg" alt="Here&Hear Logo" width={60} height={60} className="mx-auto" />
          <h1 className="text-2xl font-bold pt-4">Here&Hear</h1>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {form.formState.errors.root && (
                <div className="text-red-600 text-sm font-medium p-3 bg-red-100 rounded-md">
                  {form.formState.errors.root.message}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="이메일을 입력하세요" {...field} onChange={handleEmailInputChange} />
                      </FormControl>
                      {!isLogin && (
                        <Button type="button" variant="outline" onClick={handleCheckEmail}>
                          중복확인
                        </Button>
                      )}
                    </div>
                    {!isLogin && idCheck && (
                      <p className={`text-sm mt-2 ${idCheck.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {idCheck.message}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isLogin && (
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>사용자 이름</FormLabel>
                      <FormControl>
                        <Input placeholder="사용자 이름을 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="비밀번호를 입력하세요" {...field} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isLogin && (
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호 확인</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showConfirmPassword ? "text" : "password"} placeholder="비밀번호를 다시 입력하세요" {...field} />
                           <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full bg-[#FF6C97] hover:bg-[#ff588a]" disabled={isLoading || (!isLogin && !idCheck?.isAvailable)}>
                {isLoading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
          <button onClick={toggleForm} className="text-sm text-gray-600 hover:underline">
            {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
          </button>
          <a href="#" className="text-sm text-gray-600 hover:underline">비밀번호를 잊으셨나요?</a>
        </CardFooter>
      </Card>
    </div>
  )
}
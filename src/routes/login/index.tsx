import { $, component$, type QRL } from '@builder.io/qwik';
import { routeLoader$, useNavigate } from '@builder.io/qwik-city';
import { formAction$, useForm, setError, valiForm$, setValue } from '@modular-forms/qwik';
import type { InitialValues, SubmitHandler } from '@modular-forms/qwik';
import * as v from 'valibot';
import api from '../../utils/axios';

//  Valibot kütüphanesi kullanılarak, her bir form alanı için doğrulama kuralları belirlenir.
const LoginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty('Lütfen e-postanızı girin.'),
    v.email('Lütfen geçerli bir email adresi girin')
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty('Lütfen şifrenizi girin.'),
    v.minLength(4, 'Şifreniz 4 karakter veya daha fazla olmalıdır.')
  )
});

type LoginForm = v.InferInput<typeof LoginSchema>;

// Formun sunucu tarafında yapılacak işlevini tanımlar. Form verilerinin doğrulanması ve işlenmesi.
export const useFormAction = formAction$<LoginForm>((values) => {

}, valiForm$(LoginSchema));

//Formun başlangıç verilerini yükler. Burada e-posta ve şifre alanları başlangıçta boş olarak ayarlanmıştır.
export const useFormLoader = routeLoader$<InitialValues<LoginForm>>(() => ({
  email: '',
  password: '',
}));

export default component$(() => {

  const nav = useNavigate();

  const [loginForm, { Form, Field }] = useForm<LoginForm>({
    loader: useFormLoader(), // Form başlangıç verilerini yükler.
    action: useFormAction(), // Form gönderildiğinde yapılacak işlemi belirtir.
    validate: valiForm$(LoginSchema), // Form doğrulama şemasını belirler.
  });

  // Serileştirme sorunlarını önlemek için handSubmit işlevini QRL olarak sarın.
  // Formu gönderme.
  const handleSubmit: QRL<SubmitHandler<LoginForm>> = $(async (values) => {
    try {
      await api.get('/sanctum/csrf-cookie'); // CSRF token al.
      const response = await api.post('/login', {
        email: values.email,
        password: values.password,
      });

      if (response.status === 204) {
        await nav('/'); // Başarılı girişten sonra yönlendirme.
      }
    } catch (error: any) {
      if (error.response) {
        switch (error.response.status) {
          case 422: {
            const errors = error.response.data.errors;
            Object.keys(errors).forEach((key) => {
              // Form alanlarına hata mesajlarını ekleme
              setError(loginForm, key as 'email' | 'password', errors[key]);
            });
            setValue(loginForm, 'password', '', { shouldValidate: false }); // Şifreyi sıfırla
            break;
          }
          default:
            console.error('Login error:', error.response.data.message);
        }
      } else {
        console.error('Unexpected error:', error.message);
      }
    }
  });

  return (
    <div class="container mx-auto flex flex-col justify-center items-center w-[400px]">
      <div class="text-center text-[24px] text-gray-900 dark:text-gray-300 mb-4 font-bold uppercase">
        Üye Giriş Formu
      </div>
      <Form onSubmit$={handleSubmit}>
        <div class="px-6 pb-1.5 text-gray-700 dark:text-gray-400 text-[14px]">Eposta</div>
        <div class="px-6 pb-2">
          <Field name="email">
            {(field, props) => (
              <div>
                <input
                  {...props}
                  type="email"
                  value={field.value}
                  class="input-class"
                  placeholder="E-posta adresiniz"
                />
                {field.error && <div class="text-red-500">{field.error}</div>}
              </div>
            )}
          </Field>
        </div>
        <div class="px-6 pb-2">
          <Field name="password">
            {(field, props) => (
              <div>
                <input
                  {...props}
                  type="password"
                  value={field.value}
                  class="input-class"
                  placeholder="Şifre"
                />
                {field.error && <div class="text-red-500">{field.error}</div>}
              </div>
            )}
          </Field>
        </div>
        <div class="px-6">
          <button type="submit" class="btn-class">
            Login
          </button>
        </div>
      </Form>
    </div>
  );
});

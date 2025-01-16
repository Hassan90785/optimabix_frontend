import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {MessageService} from 'primeng/api';
import {RestApiService} from '../../../core/services/rest-api.service';
import {AdminStore} from '../../../core/stores/admin.store';
import {Company} from '../../../core/models/Company';
import {InputText} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonDirective} from 'primeng/button';

@Component({
  selector: 'app-company-add',
  templateUrl: './company-add.component.html',
  styleUrls: ['./company-add.component.scss'],
  standalone: true,
  providers: [MessageService, RestApiService],
  imports: [
    ReactiveFormsModule,
    InputText,
    DropdownModule,
    ButtonDirective
  ]
})
export class CompanyComponent implements OnInit, OnDestroy {
  companyForm: FormGroup;
  subscriptions: Subscription = new Subscription();
  logoBase64: string  | null = null;
  constructor(
    private fb: FormBuilder,
    private apiService: RestApiService,
    private messageService: MessageService
  ) {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      registrationNumber: ['', Validators.required],
      businessType: ['', Validators.required],
      contactDetails: this.fb.group({
        email: ['', [Validators.email]],
        phone: [''],
        address: this.fb.group({
          street: [''],
          city: [''],
          state: [''],
          country: [''],
          postalCode: [''],
        }),
      }),
      logo: [''],
      accessStatus: ['Active'],
    });
  }

  ngOnInit(): void {
    // Initialize or fetch data as needed
  }

  onSubmit(): void {
    if (this.companyForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly.',
      });
      return;
    }

    AdminStore.setLoader(true);

    const companyData: Company = {
      ...this.companyForm.value,
      logo: this.logoBase64, // Attach the base64-encoded logo
    };

    this.subscriptions.add(
      this.apiService.createCompany(companyData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Company created successfully.',
          });
          this.companyForm.reset();
          this.logoBase64 = null;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
          });
        },
        complete: () => AdminStore.setLoader(false),
      })
    );
  }


  onLogoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.logoBase64 = reader.result as string;
        this.messageService.add({
          severity: 'info',
          summary: 'Logo Uploaded',
          detail: `File uploaded successfully.`,
        });
      };
      reader.onerror = () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: 'Failed to read the file.',
        });
      };
      reader.readAsDataURL(file);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'No File Selected',
        detail: 'Please select a file to upload.',
      });
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

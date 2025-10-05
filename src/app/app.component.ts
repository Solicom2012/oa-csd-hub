import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Position {
  level: number;
  title: string;
  postNumber: number;
  defaultJobTitle: string;
  userJobTitle: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  TITLE = 'سیستم اتوماسیون اداری ';
  showModal = false;

  jobTitles = [
    { id: 1, title: 'مدیر ارشد' },
    { id: 2, title: 'مدیر' },
    { id: 3, title: 'معاون' },
    { id: 4, title: 'سرپرست' },
    { id: 5, title: 'کارشناس' }
  ];

  mainGridData: Position[] = [
    { level: 1, title: 'مدیر', postNumber: 122, defaultJobTitle: 'مدیر اداری', userJobTitle: '-' },
    { level: 1, title: 'مدیر', postNumber: 123, defaultJobTitle: 'مدیر برنامه‌ریزی', userJobTitle: '-' },
    { level: 2, title: 'معاون', postNumber: 111, defaultJobTitle: 'معاون مالی', userJobTitle: '-' }
  ];

  form: FormGroup;
  editingIndex: number | null = null;
  adding = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      level: [{ value: null, disabled: true }],
      title: [null, Validators.required],
      postNumber: [null, [Validators.required, Validators.min(1)]],
      defaultJobTitle: [''],
      userJobTitle: ['']
    });
  }

  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; this.resetForm(); }

  addItem() {
    this.adding = true;
    this.editingIndex = null;
    this.form.reset({ level: null, title: null, postNumber: null, defaultJobTitle: '', userJobTitle: '' });
  }

  editItem(i: number) {
    this.editingIndex = i;
    this.adding = false;
    const pos = this.mainGridData[i];
    this.form.setValue({
      level: pos.level,
      title: pos.title,
      postNumber: pos.postNumber,
      defaultJobTitle: pos.defaultJobTitle,
      userJobTitle: pos.userJobTitle
    });
  }

  deleteItem(i: number) {
    if (confirm('آیا مطمئن هستید؟')) {
      this.mainGridData.splice(i, 1);
    }
  }

  saveForm() {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const derivedLevel = raw.level ?? (this.jobTitles.find(j => j.title === raw.title)?.id ?? 0);
    const newPosition: Position = { ...raw, level: derivedLevel } as Position;
    if (this.editingIndex !== null) {
      this.mainGridData[this.editingIndex] = newPosition;
    } else {
      this.mainGridData.push(newPosition);
    }
    this.resetForm();
  }

  cancelForm() { this.resetForm(); }

  onTitleSelected(event: Event) {
    const select = event.target as HTMLSelectElement;
    const title = select.value;
    const job = this.jobTitles.find(j => j.title === title);
    if (job) this.form.patchValue({ level: job.id });
  }

  private resetForm() {
    this.form.reset({ level: null, title: null, postNumber: null, defaultJobTitle: '', userJobTitle: '' });
    this.editingIndex = null;
    this.adding = false;
  }
}

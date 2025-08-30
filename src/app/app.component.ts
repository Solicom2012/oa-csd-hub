import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Position {
  id?: string;
  level: number;
  title: string;
  postNumber: number;
  titleCode?: string;
  defaultJobTitle: string;
  userJobTitle: string;
}

interface JobTitle {
  id: number;
  title: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  readonly TITLE = 'مدیریت سمت‌های سازمانی';

  showModal = false;
  editingIndex: number | null = null;
  adding = false;

  formModel: Position = this.resetFormModel();
  mainGridData: Position[] = [];
  jobTitles: JobTitle[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadJobTitles();
    this.loadPositions();
  }

  /** Load JobTitles from microservice (port 3002) */
  loadPositions() {
    this.http.get<{ positions: Position[] }>('http://localhost:3001/positions')
      .subscribe({
        next: (data) => {
          console.log('Loaded positions:', data);  // بررسی داده‌های دریافتی
          this.mainGridData = data.positions;
        },
        error: (error) => console.error('Error loading positions:', error)
      });
  }
  
  loadJobTitles() {
    this.http.get<{ jobTitles: JobTitle[] }>('http://localhost:3002/jobTitles')
      .subscribe({
        next: (data) => {
          console.log('Loaded job titles:', data);  // بررسی داده‌های دریافتی
          this.jobTitles = data.jobTitles;
        },
        error: (error) => console.error('Error loading job titles:', error)
      });
  }
  
  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; this.cancelForm(); }

  addItem() { 
    this.adding = true; 
    this.editingIndex = null; 
    this.formModel = this.resetFormModel(); 
    this.openModal();
  }

  editItem(index: number) { 
    this.editingIndex = index; 
    this.adding = false; 
    this.formModel = { ...this.mainGridData[index] }; 
    this.openModal();
  }

  deleteItem(index: number) {
    const item = this.mainGridData[index];
    if (!item.id) return;
    
    this.http.delete(`http://localhost:3001/positions/${item.id}`)
      .subscribe({
        next: () => this.loadPositions(),
        error: (error) => console.error('Error deleting position:', error)
      });
  }

  onTitleSelected(title: string) {
    const job = this.jobTitles.find(j => j.title === title);
    if (job) {
      this.formModel.level = job.id;
      this.formModel.title = job.title;
    }
  }

  saveForm() {
    if (!this.formModel.level || !this.formModel.title || !this.formModel.postNumber) {
      alert('لطفاً فیلدهای ضروری را پر کنید');
      return;
    }

    if (this.editingIndex !== null && this.formModel.id) {
      // Edit existing position
      this.http.put(`http://localhost:3001/positions/${this.formModel.id}`, this.formModel)
        .subscribe({
          next: () => {
            this.loadPositions();
            this.closeModal();
          },
          error: (error) => console.error('Error updating position:', error)
        });
    } else if (this.adding) {
      // Add new position
      this.http.post(`http://localhost:3001/positions`, this.formModel)
        .subscribe({
          next: () => {
            this.loadPositions();
            this.closeModal();
          },
          error: (error) => console.error('Error adding position:', error)
        });
    }
  }

  cancelForm() {
    this.editingIndex = null;
    this.adding = false;
    this.formModel = this.resetFormModel();
  }

  private resetFormModel(): Position {
    return { 
      level: 0,
      title: '',
      postNumber: 0,
      defaultJobTitle: '',
      userJobTitle: '' 
    };
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEsc(event: KeyboardEvent) { 
    if (this.showModal) this.closeModal(); 
  }
}